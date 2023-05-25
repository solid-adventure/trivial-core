const APIService = require('./APIService')
const ManifestMigrator = require('./ManifestMigrator')

class AppSettings {
  constructor(app_id, port, uid, hostname, domain, load_balancer, aws_role) {
    this.app_id = app_id
    this.port = port
    this.uid = uid
    this.hostname = hostname
    this.domain = domain
    this.load_balancer = load_balancer
    this.aws_role = aws_role
  }
}


class AppManager {

  static get _knownApps() {
    return this._apps = this._apps || {}
  }

  static async info(app_id, req) {
    if (this._knownApps[app_id]) {
      return this._knownApps[app_id]
    }

    let apps = await this._userApps(req)
    apps.forEach(app => {
      this._knownApps[app.name] = new AppSettings(app.name, app.port, req.signedCookies['trivial-uid'], app.hostname, app.domain, app.load_balancer, app.aws_role)
    })

    return this._knownApps[app_id]
  }

  static async _userApps(req) {
    const service = new APIService('trivial', req)
    return await service.fetchJSON('/apps')
  }

  static async requireAuthorization(app_id, req) {
    const settings = await this.info(app_id, req)
    if (!settings) {
      throw new Error(`Not authorized to build ${app_id}`)
    }
    return settings
  }

  static async normalizeManifest(manifest, app_id, req) {
    try {
      const settings = await this.requireAuthorization(app_id, req)
      manifest.app_id = settings.app_id
      manifest.listen_at.port = settings.port
    } catch (e) { }
    return manifest
  }

  static async currentManifest(app_id, req) {
    const service = new APIService('trivial', req)
    let manifests = await service.fetchJSON('/manifests', {app_id})
    if (manifests.length < 1) {
      return undefined
    }
    return new ManifestMigrator(JSON.parse(manifests[0].content)).migrate()
  }
}

module.exports = AppManager
