const Redactions = require('../../Redactions')
const ActionInput = require('../ActionInput')
const ActionOutput = require('../ActionOutput')
const CredentialManager = require('../../CredentialManager')
const fetch = require('node-fetch')
const ApiKey = require('../../ApiKey')
const EXPIRATION_CUTOFF = 60
const ContextManager = require('../../ContextManager')

const TimeAgo = require('javascript-time-ago')
const en = require('javascript-time-ago/locale/en.json')
TimeAgo.addDefaultLocale(en)

class ActionBase {
  constructor(actionInput) {
    this.input = actionInput
    this.output = new ActionOutput(actionInput)
    this._childResults = []
    this.timeAgo = new TimeAgo('en-US')
  }

  async invoke() {
    this.output.proceed = await this.perform()
    return this.output
  }

  async perform() {
    return true
  }

  get name() {
    return this.constructor && this.constructor.name ? this.constructor.name : '(action)'
  }

  get logger() { return this.input.logger }
  get config() { return this.input.config }
  get request() { return this.input.request }
  get response() { return this.input.response }
  get values() { return this.input.values }
  get additionalParams() { return this.input.additionalParams}
  get inputName() { return this.input.inputName }
  get inputValue() { return this.input.inputValue }
  get outputName() { return this.input.outputName }
  get diagnostics() { return this.input.diagnostics }
  get logVerbose() { return this.inputValue.trivialLogLevel && this.inputValue.trivialLogLevel.toLowerCase() == 'verbose' }

  setOutputValue(value) {
    this.output.setValue(this.outputName, value)
  }

  setHTTPResponseOutput(response, body) {
    this.setOutputValue({
      status: response.status,
      headers: response.headers,
      body
    })
  }

  basicAuthHeader(user, pass) {
    const encoded = Buffer.from(`${user}:${pass}`).toString('base64')
    return {'authorization': `Basic ${encoded}`}
  }

  formEncoded(object) {
    const params = new URLSearchParams()

    function encodeInner(item, prefix, fmtKey) {
      for (let [key, value] of Object.entries(item)) {
        const type = typeof value
        if ('object' === type || 'function' == type || Array.isArray(value)) {
          encodeInner(value, `${prefix}${fmtKey(key)}`, k => `[${k}]`)
        } else {
          params.append(`${prefix}${fmtKey(key)}`, String(value))
        }
      }
    }
    encodeInner(object, '', k => String(k))

    return params.toString()
  }

  logEvent(event, success, detail, transformId) {
    this.logger.info({event, success, detail}, `[${this.name}][event] ${event}`)
    this.diagnostics.events.push(
      JSON.parse(Redactions.redact({time: new Date().toISOString(), event, success, detail, transformId}))
    )
  }

  logError(err) {
    this.logger.error({err}, `[${this.name}][error] Error`)
    this.diagnostics.errors.push(err)
  }

  async fetch(...args) {
    let method = (args[1] || {}).method || 'GET'
    this.logEvent(`${method}`, true, {url: args[0], ...(args[1] || {})})
    return fetch(...args)
  }

  lastOutput() {
    return this._childResults.length === 0 ?
      undefined :
      this._childResults[this._childResults.length - 1]
  }

  canProceed(){
    const last = this.lastOutput()
    return last ? last.proceed : true
  }

  additionalParamsForInput(context, values, additionalParams) {
    let forwardToContext = {}
    if (values.additionalParams && ContextManager.mappings[context]) {
      for (let key of ContextManager.mappings[context]) {
        forwardToContext[key] = values.additionalParams[key]
      }
    }
    let out = {additionalParams: Object.assign({}, forwardToContext, additionalParams)}
    return out
  }

  async nextInput(config, inputName, outputName, additionalParams, caller) {
    const last = this.lastOutput()
    let values = last ? last.outputValues() : this.input.values
    values = Object.assign(values, this.additionalParamsForInput(caller, values, additionalParams))

    const context = Object.assign(
      {},
      this.input.context,
      {
        diagnostics: this.input.diagnostics,
        origConfig: config,
        config: await CredentialManager.resolveCredentials(config),
        inputName,
        outputName,
        values
      }
    )
    return new ActionInput(context)
  }

  setLastOutput(output) {
    this._childResults.push(output);
    [...output.assignedEntries()].forEach(entry => {
      const [name, value] = entry
      this.output.setValue(name, value)
    })
  }

  async fetchInternalAPI(...args) {
    args[0] = new URL(args[0], process.env.LOG_TO_URL).href
    if (! args[1]) {
      args[1] = {}
    }
    if (! args[1].headers) {
      args[1].headers = {}
    }
    const token = await this.internalAuthKey()
    args[1].headers['x-trivial-app-id'] = process.env.APP_ID
    args[1].headers['authorization'] = `Bearer ${token}`
    return await this.fetch(...args)
  }

  async internalAuthKey() {
    if (this.credentialName) {
      return this.internalAuthKeyFromVault()
    } else {
      return this.internalAuthKeyFromConfig()
    }
  }

  async internalAuthKeyFromVault() {
    const apiKey = new ApiKey(this.config[this.credentialName][this.internalAPIKeyConfigName])
    if (apiKey.willExpire(EXPIRATION_CUTOFF)) {
      const res = await this.fetch(
        new URL(`/credential_sets/${this.credentialSetId}/api_key`, process.env.LOG_TO_URL).href,
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${apiKey.token}`
          },
          body: JSON.stringify({
            path: this.internalAPIKeyConfigName
          })
        }
      )
      if (res.ok) {
        const body = await res.json()
        return body.api_key
      } else {
        // TODO: if the status is Conflict (409), we should instead re-fetch the credentials
        throw new Error(`Failed to refresh API key: ${res.status} ${res.statusText}`)
      }
    } else {
      return apiKey.token
    }
  }

  async internalAuthKeyFromConfig() {
    const apiKey = new ApiKey(this.config[this.internalAPIKeyConfigName])
    if (apiKey.willExpire(EXPIRATION_CUTOFF)) {
      const res = await this.fetch(
        new URL(`/apps/${process.env.APP_ID}/api_key`, process.env.LOG_TO_URL).href,
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${apiKey.token}`
          },
          body: JSON.stringify({
            path: this.credentialsPathTo(this.internalAPIKeyConfigName).join('.')
          })
        }
      )
      if (res.ok) {
        const body = await res.json()
        return body.api_key
      } else {
        // TODO: if the status is Conflict (409), we should instead re-fetch the credentials
        throw new Error(`Failed to refresh API key: ${res.status} ${res.statusText}`)
      }
    } else {
      return apiKey.token
    }
  }

  get internalAPIKeyConfigName() {
    return 'api_key'
  }

  configAtPath(path) {
    return path.reduce((obj, name) => (obj || {})[name], this.config)
  }

  credentialsPathTo(name) {
    const origConfig = this.input.context.origConfig
    return ((origConfig || {})[name] || {}).$ref
  }

  static get redactPaths() {
    return []
  }
}

module.exports = ActionBase
