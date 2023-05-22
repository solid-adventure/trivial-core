const AppTemplate = require('../AppTemplate')
const fs = require('fs').promises
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const AdmZip = require('adm-zip')
const {
  LambdaClient,
  PublishLayerVersionCommand
} = require('@aws-sdk/client-lambda')

// LayerBuilder builds an archive from an application template, suitable for publication as a lambda layer
class LayerBuilder {
  constructor(templateName, version) {
    this.templateName = templateName
    this.templateVersion = version
    this.template = new AppTemplate(this.templateName, this.templateVersion)
  }

  async _pathExists(path) {
    try {
      await fs.access(path)
      return true
    } catch (error) {
      if (error.code == 'ENOENT') {
        return false
      } else {
        throw error
      }
    }
  }

  async _nodeModulesExists() {
    return await this._pathExists(this.template.nodeModulesPath)
  }

  async clean() {
    if (this._nodeModulesExists()) {
      await fs.rmdir(this.template.nodeModulesPath, {recursive: true})
    }
  }

  async install() {
    await exec('npm install --package-lock=false --no-optional', {
      cwd: this.template.appPath
    })
  }

  async _package() {
    const zip = new AdmZip()
    await zip.addLocalFolderPromise(
      this.template.nodeModulesPath, {zipPath: 'nodejs/node_modules'}
    )
    return await zip.toBufferPromise()
  }

  async build() {
    await this.clean()
    await this.install()
    const data = await this._package()
    await this.clean()
    return data
  }

  async publish() {
    const client = new LambdaClient()
    const response = await client.send(
      new PublishLayerVersionCommand({
        LayerName: this.template.layerName,
        CompatibleRuntimes: ['nodejs14.x'],
        Content: {
          ZipFile: await this.build()
        }
      })
    )
    console.info(response)

    return response.LayerVersionArn
  }
}

module.exports = LayerBuilder
