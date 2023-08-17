const AppTemplate = require('./AppTemplate')
const AppManager = require('./AppManager')
const GitManager = require('./GitManager')
const APIService = require('./APIService')
const ZipWriter = require('./aws/ZipWriter')
const FileWriter = require('./FileWriter')
const CodeGenerator2 = require('./generatorv2/CodeGenerator')
const LoadBalancerConfiguration = require('./aws/LoadBalancerConfiguration')
const DNSConfiguration = require('./aws/DNSConfiguration')
const LogConfiguration = require('./aws/LogConfiguration')
const FeatureManager = require('./FeatureManager')
const fs = require('fs').promises
const path = require('path')
const {
  LambdaClient,
  CreateFunctionCommand,
  DeleteFunctionCommand,
  GetFunctionCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand
} = require('@aws-sdk/client-lambda')

// retention time in days. must be one of the values suppored by AWS:
//   1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, or 3653
const DEFAULT_LOG_RETENTION = 90
// allowed execution time per request in seconds
const DEFAULT_LAMBDA_TIMEOUT = 120

class AppBuilder {
  // valid options are:
  //  - template: app template name
  //  - version: version of the app template
  //  - req: http request (identifies requesting user)
  //  - github: { branch, author_name, author_email, commit_message }
  constructor(appId, options) {
    this.appId = appId
    this.options = Object.assign({}, options)
  }

  async createDownload(inputManifest) {
    const writer = new ZipWriter()
    await this._assembleCode(inputManifest, true, writer)
    return writer.toBuffer()
  }

  github_attrs(inputManifest) {
    return [
      inputManifest.github.org,
      inputManifest.github.repo,
      this.options.github.branch || inputManifest.github.default_branch,
      this.localPath(inputManifest),
      this.options.github.author_name,
      this.options.github.author_email
    ]
  }

  async pushToGitHub(inputManifest) {
    if (!inputManifest.github ) { return true }
      console.log(`[AppBuilder]  Starting push to GitHub`)
      await this.writeLocally(inputManifest)
      const gitManager = new GitManager(...this.github_attrs(inputManifest))
      await gitManager.pushChanges(this.options.github.commit_message)
      console.log(`[AppBuilder] Completed push to GitHub`)
  }

  deployVia(inputManifest) {
    if (typeof(inputManifest.deploy_via) == 'undefined') {
      return 'aws_lambda'
    }
    // if (inputManifest.deploy_via === "github") {
    //   return "github"
    // } else {
    // // No deploy_via set, default is to deploy as Lambda
    //   return "aws_lambda"
    // }

  }

  async build(inputManifest) {
    this.pushToGitHub(inputManifest)
    await this._buildLamda(inputManifest)
  }

  async _buildLamda(inputManifest) {
    if (this.deployVia(inputManifest) != "aws_lambda") { return }
    try {
      this.buildStart = Date.now()
      const writer = new ZipWriter()
      const { manifest, layers } = await this._assembleCode(inputManifest, false, writer)
      await this._uploadLambda(manifest, writer, layers)
      await this._logBuildCompletion()
    } catch (err) {
      await this._logBuildCompletion(err)
      throw err;
    }    
  }

  localPath(inputManifest) {
    return `./slugs/${inputManifest.app_id}`
  }

  async writeLocally(inputManifest) {
    this.logger.debug(`[AppBuilder]    Starting to write '${inputManifest.app_id}'`)
    let path = this.localPath(inputManifest)
    fs.mkdir(path, {recursive: true})
    const writer = new FileWriter(path)
    await this._assembleCode(inputManifest, true, writer)
    this.logger.debug(`[AppBuilder]    Results at ${path}`)
  }

  async _assembleCode(inputManifest, useEnv, writer) {
    const manifest = await this._normalizeManifest(inputManifest)
    this.logger.debug(`[AppBuilder]    Building...`)
    const template = new AppTemplate(manifest.template, manifest.version, null, manifest.template_dir)
    await this._writeTemplate(manifest, writer, template)
    await this._writeCode(manifest, writer)
    const layers = await this._writePackageFile(manifest, writer, template)
    await this._writeManifest(manifest, writer, useEnv)
    return { manifest, writer, layers }
  }

  async _normalizeManifest(inputManifest) {
    return await AppManager.normalizeManifest(inputManifest, this.appId, this.options.req)
  }

  async _writeTemplate(manifest, writer, template) {
    const ignore = ['build.js', 'package.json', 'server.conf']

    async function copyDir(dir, base) {
      const entries = await fs.readdir(dir, {withFileTypes: true})
      for (let i = 0; i < entries.length; ++i) {
        let dirent = entries[i]
        let newPath = path.join(dir, dirent.name)
        let name = `${base}${dirent.name}`

        if (dirent.isDirectory()) {
          if ('node_modules' !== name) {
            await copyDir(newPath, `${name}/`)
          }
        } else if (-1 === ignore.indexOf(name)) {
          await writer.write(name, await fs.readFile(newPath, {encoding: 'utf8'}))
        }
      }
    }

    await copyDir(template.appPath, '')
    await copyDir(path.resolve(__dirname, '../lib'), 'lib/')
  }

  async _writeCode(manifest, writer) {
    const gen = this._generator(manifest)
    await gen.build(writer)
  }

  _generator(manifest) {
    if (manifest.manifest_version === 2) {
      return new CodeGenerator2(manifest, this._featureSettings())
    }
  }

  _featureSettings() {
    if (this.options.req) {
      return FeatureManager.requestSettings(this.options.req)
    }
  }

  async _writePackageFile(manifest, writer, template) {
    const pkg = await template.packageJson()
    const layers = pkg.config.layers
    delete pkg.config.layers
    await writer.write('package.json', JSON.stringify(pkg, null, 2))
    return layers
  }

  async _writeManifest(manifest, writer, useEnv) {
    if (useEnv) {
      manifest = this._manifestForEnvOnly(manifest)
    }
    await writer.write('manifest.json', JSON.stringify(manifest, null, 2))
  }

  _manifestForEnvOnly(input) {
    const varNames = new Set()
    const output = JSON.parse(JSON.stringify(input))
    function envRef(action, key) {
      const base = `${action.perform}_${key}`.toUpperCase()
      let name = base
      let idx = 0
      while (varNames.has(name)) {
        name = `${base}_${++idx}`
      }
      varNames.add(name)
      return {$env: name}
    }

    output.processors.forEach(proc => {
      proc.actions.forEach(action => {
        for (let [key, value] of Object.entries(action.config)) {
          if ('object' === typeof value && value.hasOwnProperty('$ref')) {
            action.config[key] = envRef(action, key)
          }
        }
      })
    })

    return output
  }

  _appId(manifest) {
    return manifest.app_id
  }

  _functionName(appId) {
    return `${process.env.LAMBDA_PREFIX || ''}${appId}`
  }

  async _roleArn() {
    const info = await AppManager.info(this.appId, this.options.req)
    return info.aws_role
  }

  _env(manifest) {
    return {
      APP_ID: manifest.app_id,
      LOG_TO_URL: `${manifest.log_to.host}:${manifest.log_to.port}${manifest.log_to.path}`,
      LOG_TO_VERB: manifest.log_to.verb,
      FIXIE_SOCKS_HOST: `${process.env.FIXIE_SOCKS_HOST}`
    }
  }

  async _lambdaInfo(client, appId) {
    try {
      return  await client.send(
        new GetFunctionCommand({FunctionName: this._functionName(appId)})
      )
    } catch (e) {
      if ('ResourceNotFoundException' === e.name) {
        return undefined
      } else {
        throw e
      }
    }
  }

  async _uploadLambda(manifest, writer, layers) {
    const client = new LambdaClient()
    const response = await this._lambdaInfo(client, this._appId(manifest))
    if (response) {
      await this._updateLambda(manifest, writer, layers, client, response)
    } else {
      await this._createLambda(manifest, writer, layers, client)
    }
  }

  async _createLambda(manifest, writer, layers, client) {
    this.logger.debug(`[AppBuilder][_createLambda] creating lambda`)
    const response = await client.send(
      new CreateFunctionCommand({
        Code: {
          ZipFile: await writer.toBuffer()
        },
        Environment: {
          Variables: this._env(manifest)
        },
        FunctionName: this._functionName(this._appId(manifest)),
        Handler: 'lambda.handler',
        Layers: layers,
        PackageType: 'Zip',
        Role: await this._roleArn(),
        Runtime: 'nodejs14.x',
        Timeout: DEFAULT_LAMBDA_TIMEOUT
      })
    )

    await this._waitUntilLambdaReady(client, response.FunctionArn)
    await this._routeToLambda(manifest, response.FunctionArn)
    await this._initLambdaLogs(response.FunctionName)

    return response
  }

  async _waitUntilLambdaReady(client, lambdaArn) {
    const times = [10, 100, 1000, 3000, 6000, 9000, 18000]
    let res = null

    for (let i = 0; i < times.length; ++i) {
      this.logger.debug(`[AppBuilder][_waitUntilLambdaReady] waiting for lambda to activate`)
      res = await client.send(new GetFunctionCommand({FunctionName: lambdaArn}))
      if (this._isReadyLambda(res)) {
        return true
      }
      await new Promise(resolve => setTimeout(resolve, times[i]))
    }

    res = await client.send(new GetFunctionCommand({FunctionName: lambdaArn}))
    if (!this._isReadyLambda(res)) {
      throw new Error('Timed out waiting for app to activate.')
    }
  }

  _isReadyLambda(response) {
    const state = response.Configuration.State
    const lastUpdate = response.Configuration.LastUpdateStatus

    return 'Pending' !== state && 'InProgress' !== lastUpdate
  }

  async _routeToLambda(manifest, lambdaArn) {
    const info = await AppManager.info(this.appId, this.options.req)
    const domain = info.domain
    const hostname = `${info.hostname}.${domain}`
    const elb = new LoadBalancerConfiguration(info.load_balancer, {logger: this.logger})
    await this._addHostName(domain, hostname, elb)
  }

  async _addHostName(domain, fullHostname, elb) {
    this.logger.debug(`[AppBuilder][_addHostName] updating DNS`)
    const dns = new DNSConfiguration(domain, {logger: this.logger})
    await dns.aliasNameToLoadBalancer(`${fullHostname}.`, elb)
  }

  async _initLambdaLogs(lambdaName) {
    this.logger.debug('[AppBuilder][_initLambdaLogs] setting up logging')
    const logs = new LogConfiguration({logger: this.logger})
    await logs.createLambdaLogGroup(lambdaName, {retentionInDays: DEFAULT_LOG_RETENTION})
  }

  async _updateLambda(manifest, writer, layers, client, info) {
    this.logger.debug(`[AppBuilder][_updateLambda] updating lambda`)
    const response = await client.send(
      new UpdateFunctionCodeCommand({
        FunctionName: info.Configuration.FunctionName,
        ZipFile: await writer.toBuffer()
      })
    )
    await this._waitUntilLambdaReady(client, info.Configuration.FunctionArn)
    await this._ensureCorrectLayers(client, info, layers)
    await this._checkRouteToLambda(manifest, info.Configuration.FunctionArn)
    await this._checkLambdaLogs(info.Configuration.FunctionName)
    return response
  }

  async _ensureCorrectLayers(client, info, layers) {
    const existing = info.Configuration.Layers.map(l => l.Arn)
    const hasAll = layers.every(l => -1 !== existing.indexOf(l))

    if (! hasAll) {
      const newLayers = existing
        .filter(l1 => layers.find(l2 => this._layersMatchWithoutVersion(l1, l2)) === undefined)
        .concat(layers)

      await client.send(
        new UpdateFunctionConfigurationCommand({
          FunctionName: info.Configuration.FunctionName,
          Layers: newLayers
        })
      )
    }
  }

  _layersMatchWithoutVersion(layer1, layer2) {
    const base1 = String(layer1).replace(/:[0-9]+$/, '')
    const base2 = String(layer2).replace(/:[0-9]+$/, '')
    return base1 === base2
  }

  async _checkRouteToLambda(manifest, lambdaArn) {
    const info = await AppManager.info(this.appId, this.options.req)
    const elb = new LoadBalancerConfiguration(info.load_balancer, {logger: this.logger})
    const functionName = this._functionName(info.app_id)
    const dns = new DNSConfiguration(info.domain, {logger: this.logger})
    const dnsExists = await dns.hasEntryName(info.hostname)
    if (! dnsExists) {
      this.logger.debug(`[AppBuilder][_checkRouteToLambda] updating DNS`)
      await dns.aliasNameToLoadBalancer(`${info.hostname}.${info.domain}.`, elb)
    }
  }

  async _checkLambdaLogs(lambdaName) {
    const logs = new LogConfiguration({logger: this.logger})
    const hasGroup = await logs.lambdaHasLogGroup(lambdaName)
    if (! hasGroup) {
      await this._initLambdaLogs(lambdaName)
    }
  }

  async teardown() {
    const manifest = AppManager.currentManifest(this.appId, this.options.req)
    if (this.deployVia(manifest) != "aws_lambda") { return }
    try {
      this.teardownStart = Date.now()
      await AppManager.requireAuthorization(this.appId, this.options.req)
      await this._removeLambda(this.appId)
      await this._logTeardownCompletion()
    } catch (err) {
      await this._logTeardownCompletion(err)
      throw err;
    }
  }

  async _removeLambda(appId) {
    const info = await AppManager.info(appId, this.options.req)
    const client = new LambdaClient()
    this.logger.debug(`[AppBuilder][_removeLambda] looking up lambda`)
    const lambda = await this._lambdaInfo(client, appId)

    if (lambda) {
      this.logger.debug(`[AppBuilder][_removeLambda] removing routes`)
      const elb = new LoadBalancerConfiguration(info.load_balancer, {logger: this.logger})
      await elb.removeRoutesForLambda(this._functionName(appId), lambda.Configuration.FunctionArn)

      this.logger.debug(`[AppBuilder][_removeLambda] removing dns`)
      const dns = new DNSConfiguration(info.domain, {logger: this.logger})
      const dnsExists = await dns.hasEntryName(info.hostname)
      if (dnsExists) {
        await dns.removeNameForLoadBalancer(info.hostname, elb)
      }

      this.logger.debug(`[AppBuilder][_removeLambda] removing function`)
      await this._deleteFunction(client, lambda.Configuration.FunctionArn)

      this.logger.debug(`[AppBuilder][_removeLambda] cleaning logs`)
      await this._deleteLambdaLogs(lambda.Configuration.FunctionName)
    }
  }

  async _deleteFunction(client, lambdaArn) {
    await client.send(
      new DeleteFunctionCommand({FunctionName: lambdaArn})
    )
  }

  async _deleteLambdaLogs(lambdaName) {
    const logs = new LogConfiguration({logger: this.logger})
    await logs.deleteLambdaLogs(lambdaName)
  }

  get logger() {
    if (this.options.req && this.options.req.log)
      return this.options.req.log
    else
      return console
  }

  async _logBuildCompletion(err) {
    if (!this.options.req) return;

    try {
      const duration = Date.now() - this.buildStart
      const api = new APIService('trivial', this.options.req)
      const diagnostics = {errors: [], events: []}
      if (err) {
        diagnostics.errors.push(err)
      } else {
        diagnostics.events.push({
          time: new Date().toISOString(),
          event: `Build ${this.buildStart} succeeded`,
          success: true
        })
      }

      await api.fetchJSON(`/activity_entries`, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          app_id: this.appId,
          activity_type: 'build',
          status: err ? 500 : 200,
          duration_ms: duration,
          diagnostics
        })
      })
    } catch (logErr) {
      this.logger.error({err: logErr}, `[AppBuilder][_logBuildCompletion] could not log activity`)
    }
  }

  async _logTeardownCompletion(err) {
    if (!this.options.req) return;

    try {
      const duration = Date.now() - this.teardownStart
      const api = new APIService('trivial', this.options.req)
      const diagnostics = {errors: [], events: []}
      if (err) {
        diagnostics.errors.push(err)
      } else {
        diagnostics.events.push({
          time: new Date().toISOString(),
          event: `App deleted`,
          success: true
        })
      }

      await api.fetchJSON(`/activity_entries`, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          app_id: this.appId,
          activity_type: 'teardown',
          status: err ? 500 : 200,
          duration_ms: duration,
          diagnostics
        })
      })
    } catch (logErr) {
      this.logger.error({err: logErr}, `[AppBuilder][_logTeardownCompletion] could not log activity`)
    }
  }
}

module.exports = AppBuilder
