const ActionBase = require('./ActionBase')

class OAuth2ActionBase extends ActionBase {
  // derived classes must override this to enable token refresh
  get refreshEnabled() {
    return false;
  }

  // classes using shared credentials must override this to return the name of the credentials inside config
  get credentialName () {
  }

  get codeGrant() {
    return this.configAtPath(this.codeGrantPath)
  }

  get codeGrantPath() {
    return this.credentialName ? [this.credentialName, 'code_grant'] : ['code_grant']
  }

  get refreshConfig() {
    return this.credentialName ? this.configAtPath([this.credentialName]) : this.config
  }

  async fetchWithAuth(...args) {

    let codeGrantTokenType = ''
    try {
       codeGrantTokenType = String(this.codeGrant.token_type)
    } catch(err) {
      throw new Error(`fetchWithAuth unable to read token_type`)
    }

    if (codeGrantTokenType.toLowerCase() === 'bearer') {
      return await this.fetchWithAuthBearerRefreshable(...args)
    } else {
      throw new Error(`Unsupported token type: ${this.codeGrant.token_type}`)
    }
  }

  async fetchWithAuthBearer(...args) {
    if (! args[1]) {
      args[1] = {}
    }
    if (! args[1].headers) {
      args[1].headers = {}
    }
    args[1].headers['authorization'] = this.bearerAuthorization()
    return await this.fetch(...args)
  }

  bearerAuthorization() {
    return `Bearer ${this.codeGrant.access_token}`
  }

  async fetchWithAuthBearerRefreshable(...args) {
    const firstRes = await this.fetchWithAuthBearer(...args)
    if (this.shouldRefreshAuth(firstRes)) {
      await this.refreshAuth()
      return await this.fetchWithAuthBearer(...args)
    } else {
      return firstRes;
    }
  }

  shouldRefreshAuth(response) {
    return this.refreshEnabled && response.status === 401
  }

  async refreshAuth() {
    const proto = this.protocolHelper()
    const tokenData = await proto.refreshAccessToken(this.refreshConfig, this.logger, this.fetch.bind(this))
    await this.saveRefreshedAuthToken(tokenData)
  }

  protocolHelper() {
    return require('../catalog/ActionProtocols').forType(this.name)
  }

  async saveRefreshedAuthToken(tokenData) {
    if (this.credentialName) {
      await this.saveRefreshedAuthTokenToAccount(tokenData)
    } else {
      await this.saveRefreshedAuthTokenToApp(tokenData)
    }
  }

  async saveRefreshedAuthTokenToApp(tokenData) {
    const oldValue = this.codeGrant.access_token
    this.codeGrant.access_token = tokenData.access_token
    const res = await this.fetchInternalAPI(`/apps/${process.env.APP_ID}/credentials`, {
      method: 'PATCH',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        path: this.credentialsPathTo('code_grant').concat(['access_token']),
        credentials: {
          current_value: oldValue,
          new_value: tokenData.access_token
        }
      })
    })

    if (!res.ok)
      this.logger.warn({status: res.status, statusText: res.statusText}, 'Failed to save updated access token')
  }

  async saveRefreshedAuthTokenToAccount(tokenData) {
    const oldValue = this.codeGrant.access_token
    this.codeGrant.access_token = tokenData.access_token
    const res = await this.fetchInternalAPI(`/credential_sets/${this.credentialSetId}`, {
      method: 'PATCH',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        path: ['code_grant', 'access_token'],
        credentials: {
          current_value: oldValue,
          new_value: tokenData.access_token
        }
      })
    })

    if (!res.ok)
      this.logger.warn({status: res.status, statusText: res.statusText}, 'Failed to save updated access token')
  }

  get credentialSetId() {
    return this.input.context.origConfig[this.credentialName].$cred
  }
}

module.exports = OAuth2ActionBase
