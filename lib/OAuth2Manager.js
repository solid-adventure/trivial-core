const APIService = require('./APIService')
const ActionIterator = require('./actionsv2/catalog/ActionIterator')
const ActionProtocols = require('./actionsv2/catalog/ActionProtocols')
const CredentialTypes = require('./actionsv2/catalog/CredentialTypes')
const ActionPath = require('./actionsv2/ActionPath')
const ProtocolRequest = require('./actionsv2/ProtcolRequest')
const fetch = require('node-fetch')

class OAuth2Manager {
  constructor(req, token) {
    this.req = req
    this.token = token
  }

  async buildAuthorizationUrl() {
    await this._loadDraft()
    const config = this._config()
    const proto = await this._protocol()
    return proto.buildAuthorizationUrl(config, this.draft.token, this.redirectURL())
  }

  async requestAccessToken() {
    await this._loadDraft()
    const config = this._config()
    const proto = await this._protocol()
    try {
      const code = await proto.requestAccessToken(config, this.req, fetch, this.redirectURL())
      await this._storeAccessToken(proto, config, code)
      return this._resumeURL()
    } catch (err) {
      this.req.log.error({err}, 'Access token request failed')
      return this._resumeURL()
    }
  }

  async proxyProtocolRequest() {
    const credentialSet = await this._loadCredentialSet()
    const proto = this._loadProxiedProtocol(credentialSet)
    return this._invokeProtocolMethod(credentialSet, proto)
  }

  redirectURL() {
    return new URL(`/oauth2/authorization_response`, this._serverURL()).href
  }

  async _loadDraft() {
    const service = new APIService('trivial', this.req)
    this.draft = await service.fetchJSON(`/manifests/-/drafts/${this.token}`)
    await this._loadDraftCredentials()
  }

  async _loadDraftCredentials() {
    const service = new APIService('trivial', this.req)
    if (this._isForCredentialSet()) {
      const setId = this._actionPath.innerId || this._actionPath.id
      const credSet = await service.fetchJSON(`/credential_sets/${setId}`)
      this.credentials = credSet.credentials
    } else {
      const creds = await service.fetchJSON(`/manifests/-/drafts/${this.token}/credentials`)
      this.credentials = creds.credentials
    }
  }

  _resumeURL() {
    const builder = this._isV2() ? '/builder2' : ''
    return `/apps/${this._appName()}${builder}/${this._actionPath.path}?draft=${this.token}`
  }

  _isV2() {
    return this.draft.content.manifest_version === 2
  }

  get _actionPath() {
    return this.__actionPath = this.__actionPath || new ActionPath(this.draft.action)
  }

  _actionIdentifier() {
    return this._actionPath.id
  }

  _actionName() {
    return this._actionPath.name
  }

  _appName() {
    return this.draft.content.app_id
  }

  _isForCredentialSet() {
    return this._actionPath.type === 'vault' || this._actionPath.innerType === 'credentials'
  }

  _actionDefinition() {
    const id = this._actionIdentifier()
    if (this._isV2()) {
      return new ActionIterator(this.draft.content.program).find(a => id === a.identifier)
    } else {
      const proc = this.draft.content.processors.find(p => p.actions.find(a => id === a.identifier))
      return proc ? proc.actions.find(a => id === a.identifier) : undefined
    }
  }

  _config() {
    if (this._isForCredentialSet()) {
      return this.credentials
    } else {
      const action = this._actionDefinition()
      return action ? this._resolveCredentials(action.config) : undefined
    }
  }

  _resolveCredentials(config) {
    const out = {}
    for (let [name, value] of Object.entries(config)) {
      out[name] = this._isReference(value) ? this._getByReference(value) : value
    }
    return out
  }

  _isReference(val) {
    return val && val.hasOwnProperty('$ref')
  }

  _getByReference(ref) {
    return (this.credentials[ref.$ref[0]] || {})[ref.$ref[1]]
  }

  async _protocol() {
    if (this._isV2()) {
      return ActionProtocols.forType(this._actionPath.protocolName)
    }
  }

  async _storeAccessToken(action, config, code) {
    if (this._isForCredentialSet()) {
      config.code_grant = code
      return await this._saveCredentialSet(config)
    }

    const def = this._actionDefinition()
    if (def) {
      if (def.config && this._isReference(def.config.code_grant)) {
        const ref = def.config.code_grant
        this.credentials[ref.$ref[0]][ref.$ref[1]] = code
      } else if (action.configFields.code_grant) {
        const ident = this._actionIdentifier()
        const idx = [...Object.entries(action.configFields)].findIndex(e => e[0] === 'code_grant')
        if (! this.credentials.hasOwnProperty(ident)) {
          this.credentials[ident] = {}
        }
        this.credentials[ident][idx.toString(36)] = code
        await this._saveDraft()
      }
      await this._saveCredentials()
    }
  }

  async _saveDraft() {
    const service = new APIService('trivial', this.req)
    const res = await service.fetchJSON(
      `/manifests/${this.draft.manifest_id}/drafts/${this.token}`,
      {
        method: 'PUT',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          manifest_draft: {
            content: this.draft.content
          }
        })
      }
    )
    if (!res.ok) {
      throw new Error(`Failed to update manifest draft: ${res.statusText}`)
    }
  }

  async _saveCredentials() {
    const service = new APIService('trivial', this.req)
    const res = await service.fetchJSON(
      `/manifests/${this.draft.manifest_id}/drafts/${this.token}/credentials`,
      {
        method: 'PUT',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          credentials: this.credentials
        })
      }
    )
    if (!res.ok) {
      throw new Error(`Failed to update credentials: ${res.statusText}`)
    }
  }

  async _saveCredentialSet(credentials) {
    const service = new APIService('trivial', this.req)
    const setId = this._actionPath.innerId || this._actionPath.id
    return await service.fetchJSON(`/credential_sets/${setId}`, {
      method: 'PUT',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({credentials, credential_set: {id: setId}})
    })
  }

  async _loadCredentialSet() {
    const service = new APIService('trivial', this.req)
    const setId = this.req.params.credentialSetId
    const credSet = await service.fetchJSON(`/credential_sets/${setId}`)
    this.credentials = credSet.credentials
    return credSet.credential_set
  }

  _loadProxiedProtocol(credentialSet) {
    const credentialType = CredentialTypes.forType(credentialSet.credential_type)
    return ActionProtocols.forType(credentialType.protocolName)
  }

  async _invokeProtocolMethod(credentialSet, protocol) {
    const methodName = `perform${this.req.params.protocolMethod}`
    if ('function' === typeof protocol[methodName] && 1 === protocol[methodName].length) {
      const protoReq = new ProtocolRequest({
        config: this.credentials,
        credentialSet,
        logger: this.req.log,
        req: this.req
      })
      return await protocol[methodName](protoReq)
    } else {
      throw new Error('Unsupported method')
    }
  }

  _serverURL() {
    if (process.env.TRIVIAL_UI_URL) {
      return process.env.TRIVIAL_UI_URL
    } else {
      const isHttps = (this.req.headers['x-forwarded-proto'] || '').substring(0, 5) === 'https'
      const host = (this.req.headers['x-forwarded-host'] || this.req.headers.host)
      return `http${isHttps ? 's' : ''}://${host}`
    }
  }
}

module.exports = OAuth2Manager
