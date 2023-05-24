class CredentialTypeBase {
  get name() {
    if ('undefined' !== typeof this._typeName) {
      return this._typeName
    } else {
      return this.constructor && this.constructor.name ? this.constructor.name : '(credentials)'
    }
  }

  set name(value) {
    this._typeName = value
  }

  get serviceName() {
    return String(this.name || '').replace(/Credentials$/, '')
  }

  get protocolName() {
    return this.serviceName
  }

  // Derived classes should override this method to define their configuration fields
  getConfigFields() {
    return {}
  }

  get configFields() {
    return this._mergeInheritedResults('getConfigFields')
  }

  // Derived classes should override this method to define their configuration actions
  getConfigActions(config) {
    return {}
  }

  configActions(config) {
    return this._mergeInheritedResults('getConfigActions', config)
  }

  async afterCreate({app, credentials}) {
  }

  async createAPIKey(app) {
    const { fetchJSON } = require('../../component-utils')
    const res = await fetchJSON('/proxy/trivial', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({path: `/apps/${app.name}/api_key`})
    })
    return res.api_key
  }

  _mergeInheritedResults(name, ...args) {
    const results = []
    let proto = Object.getPrototypeOf(this)
    while (proto && name in proto) {
      results.push(proto[name].apply(this, args))
      proto = Object.getPrototypeOf(proto)
    }
    return Object.assign({}, ...results)
  }
}

module.exports = CredentialTypeBase
