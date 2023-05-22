const path = require('path')
const fs = require('fs').promises

class AppTemplate {
  constructor(name, version, initial_manifest) {
    this.name = this.constructor.validName(name)
    this.version = this.constructor.validVersion(version)
    this.initial_manifest = initial_manifest
  }

  get token() {
    return `${this.name}_${this.version}`
  }

  get layerName() {
    return this.token.replace(/\.+/g, '_')
  }

  get path() {
    return path.resolve(__dirname, path.join('..', 'templates', this.token))
  }

  get initialManifestPath() {
    try {
      return path.resolve(this.path, this.initial_manifest)
    } catch (e) {
      return path.resolve(this.path, 'initial-manifest.json')
    }
  }


  async initialManifest() {
    let rawManifest = await fs.readFile(this.initialManifestPath, {encoding: 'utf8'})
    return JSON.parse(rawManifest)
  }

  get appPath() {
    return path.resolve(this.path, 'app')
  }

  get packageJsonPath() {
    return path.resolve(this.appPath, 'package.json')
  }

  async packageJson() {
    let rawPackage = await fs.readFile(this.packageJsonPath, {encoding: 'utf8'})
    return JSON.parse(rawPackage)
  }

  get nodeModulesPath() {
    return path.resolve(this.appPath, 'node_modules')
  }

  static validName(name) {
    return String(name).replace(/[^0-9A-Za-z_-]+/g, '')
  }

  static validVersion(version) {
    return String(version).replace(/[^0-9.]+/g, '')
  }
}

module.exports = AppTemplate
