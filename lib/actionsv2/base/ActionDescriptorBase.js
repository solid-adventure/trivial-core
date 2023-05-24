class ActionDescriptorBase {
  get name() {
    if ('undefined' !== typeof this._actionName) {
      return this._actionName
    } else {
      const base = this.constructor && this.constructor.name ? this.constructor.name : '(action)'
      return base.replace(/Descriptor$/, '')
    }
  }

  set name(value) {
    this._actionName = value
  }

  get descriptiveName() {
    let name = String(this.name || '')
    name = name.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    name = name.replace(/([a-z\d])([A-Z])/g, '$1 $2')
    return name.replace(/\//g, ' ')
  }

  get iconUrl() {
    return undefined
  }

  // Derived classes should override this method to define their configuration fields
  getConfigFields() {
    return {}
  }

  get configFields() {
    return this._mergeInheritedResults('getConfigFields')
  }

  // Derived classes should override this method to define the credential types they need configured
  getCredentialTypes() {
    return {}
  }

  get credentialTypes() {
    return this._mergeInheritedResults('getCredentialTypes')
  }

  // Derived classes should override this method to define their configuration fields
  getDefinitionFields() {
    return {}
  }

  get definitionFields() {
    return this._mergeInheritedResults('getDefinitionFields')
  }

  get actionSlots() {
    return []
  }

  get contentsUserVisible() {
    return true
  }

  get expectedTypeName() {
    return 'GenericObject'
  }

  get fullDescriptionHTML() {
    return undefined
  }

  get overviewHTML() {
    return this.fullDescriptionHTML
  }

  // Derived classes should override this method to define their configuration actions
  getConfigActions(config) {
    return {}
  }

  configActions(config) {
    return this._mergeInheritedResults('getConfigActions', config)
  }

  definitionTitle(definition) {
    return definition.name || definition.type
  }

  get embedTransform() {
    return true
  }

  get editorComponent() {
    return 'Default'
  }

  get oauth2RedirectUrl() {
    const url = new URL('/oauth2/authorization_response', window.location.href)
    return url.href
  }

  async afterAdd({app, definition, credentials}) {
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

  setCredential(definition, credentials, name, value) {
    if (name in definition.config && '$ref' in definition.config[name]) {
      const ref = definition.config[name].$ref
      credentials[ref[1]] = value
    } else {
      const ref0 = definition.identifier
      const ref1 = Object.keys(definition.config).length.toString()
      credentials[ref1] = value
      definition.config[name] = {$ref: [ref0, ref1]}
    }
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

  async invokeHook(name, ...args) {
    const results = []
    let proto = Object.getPrototypeOf(this)
    while (proto && name in proto) {
      if (proto.hasOwnProperty(name)) {
        results.push(await proto[name].apply(this, args))
      }
      proto = Object.getPrototypeOf(proto)
    }
    return results
  }

  static get isUserSearchable() {
    return true
  }
}

module.exports = ActionDescriptorBase
