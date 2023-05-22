const ApiKey = require('../../ApiKey')
const EXPIRATION_CUTOFF = 60

class OAuth2ProtocolBase {
  // Derived classes must override this to provide the authorization URL
  static get authorizationUrl() {
    throw new Error('authorizationUrl has not been defined')
  }

  // Derived classes must override this to provide the token URL
  static get tokenUrl() {
    throw new Error('tokenUrl has not been defined')
  }

  // Derived classes may override this to provide a different refresh URL
  static get refreshUrl() {
    return this.tokenUrl
  }

  // Derived classes must override this to provide the client id
  static clientId(config) {
    throw new Error('clientId() has not been implemented')
  }

  // Derived classes must override this to provide the scope being requested
  static scope(config) {
    throw new Error('scope() has not been implemented')
  }

  static redirectURL(req) {
    return new URL(`/oauth2/authorization_response`, this._serverURL(req)).href
  }

  static _serverURL(req) {
    if (process.env.LUPIN_URL) {
      return process.env.LUPIN_URL
    } else {
      const isHttps = (req.headers['x-forwarded-proto'] || '').substring(0, 5) === 'https'
      const host = (req.headers['x-forwarded-host'] || req.headers.host)
      return `http${isHttps ? 's' : ''}://${host}`
    }
  }

  static buildAuthorizationUrl(config, state, redirect) {
    const url = new URL(this.authorizationUrl)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', this.clientId(config))
    url.searchParams.set('redirect_uri', redirect)
    url.searchParams.set('scope', this.scope(config))
    url.searchParams.set('state', state)
    this.prepareAuthorizationUrl(config, url)
    return url.href
  }

  // Derived classes may implement this method to customize the authorization URL that is built
  static prepareAuthorizationUrl(config, url) {
  }

  static async requestAccessToken(config, req, fetch, redirect) {
    this.assertSuccessfulAuthResponse(config, req)
    const res = await fetch(...this.buildAccessTokenRequest(config, req, redirect))
    if (! res.ok) {
      let text = await res.text()
      throw new Error(`Access token request failed: ${text}, response status: ${res.status}}` )
    }
    req.log.debug({status: res.status, statusText: res.statusText}, 'Access token request')
    return await res.json()
  }

  static assertSuccessfulAuthResponse(config, req) {
    if (req.query.error || ! req.query.code) {
      throw new Error(`Authorization failed: ${req.query.error}`)
    }
  }

  static buildAccessTokenRequest(config, req, redirect) {
    return [
      this.tokenUrl,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        body: this.buildAccessTokenRequestBody(config, req, redirect)
      }
    ]
  }

  static buildAccessTokenRequestBody(config, req, redirect) {
    const params = new URLSearchParams()
    params.set('grant_type', 'authorization_code')
    params.set('code', req.query.code)
    params.set('redirect_uri', redirect)
    params.set('client_id', this.clientId(config))
    this.prepareAccessTokenRequest(config, req, params)
    return params
  }

  // Derived classes may implement this method to customize the access token request body that is built
  static prepareAccessTokenRequest(config, req, params) {
  }

  static async refreshAccessToken(config, logger, fetch) {
    const res = await fetch(...this.buildRefreshTokenRequest(config, logger))
    if (! res.ok) {
      throw new Error(`Refresh access token request failed: ${res.statusText}`)
    }
    logger.debug({status: res.status, statusText: res.statusText}, 'Refresh access token request')
    return await res.json()
  }

  static buildRefreshTokenRequest(config, logger) {
    return [
      this.refreshUrl,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        body: this.buildRefreshTokenRequestBody(config, logger)
      }
    ]
  }

  static buildRefreshTokenRequestBody(config, logger) {
    const params = new URLSearchParams()
    params.set('grant_type', 'refresh_token')
    params.set('refresh_token', config.code_grant.refresh_token)
    this.prepareRefreshTokenRequest(config, logger, params)
    return params
  }

  // Derived classes may implement this method to customize the refresh access token request body that is built
  static prepareRefreshTokenRequest(config, logger, params) {
  }

  // the following methods are to support making authenticated API calls from protocol helpers for those classes that need to

  static get refreshEnabled() {
    return false
  }

  static async fetchWithAuth(protoReq, ...args) {
    const firstRes = await this.fetchWithAuthBearer(protoReq, ...args)
    if (this.shouldRefreshAuth(firstRes)) {
      await this.refreshAuth(protoReq)
      return await this.fetchWithAuthBearer(protoReq, ...args)
    } else {
      return firstRes;
    }
  }

  static async fetchWithAuthBearer(protoReq, ...args) {
    if (! args[1]) {
      args[1] = {}
    }
    if (! args[1].headers) {
      args[1].headers = {}
    }
    args[1].headers['authorization'] = this.bearerAuthorization(protoReq)
    return await protoReq.fetch(...args)
  }

  static bearerAuthorization(protoReq) {
    return `Bearer ${protoReq.config.code_grant.access_token}`
  }

  static shouldRefreshAuth(response) {
    return this.refreshEnabled && response.status === 401
  }

  static async refreshAuth(protoReq) {
    const tokenData = await this.refreshAccessToken(protoReq.config, protoReq.logger, protoReq.fetch.bind(protoReq))
    await this.saveRefreshedAuthToken(protoReq, tokenData)
  }

  static async saveRefreshedAuthToken(protoReq, tokenData) {
    const oldValue = protoReq.config.code_grant.access_token
    protoReq.config.code_grant.access_token = tokenData.access_token
    const res = await this.fetchInternalAPI(protoReq, `/credential_sets/${protoReq.credentialSet.id}`, {
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
      protoReq.logger.warn({status: res.status, statusText: res.statusText}, 'Failed to save updated access token')
  }

  static async fetchInternalAPI(protoReq, ...args) {
    args[0] = new URL(args[0], this.trivialURL).href
    if (! args[1]) {
      args[1] = {}
    }
    if (! args[1].headers) {
      args[1].headers = {}
    }
    const token = await this.internalAuthKey(protoReq)
    args[1].headers['authorization'] = `Bearer ${token}`
    return await protoReq.fetch(...args)
  }

  static async internalAuthKey(protoReq) {
    const apiKey = new ApiKey(protoReq.config.api_key)
    if (apiKey.willExpire(EXPIRATION_CUTOFF)) {
      const res = await protoReq.fetch(
        new URL(`/credential_sets/${protoReq.credentialSet.id}/api_key`, this.trivialURL).href,
        {
          method: 'PUT',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${apiKey.token}`
          },
          body: JSON.stringify({
            path: 'api_key'
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

  static get trivialURL() {
    return process.env.TRIVIAL_URL || 'https://trivial-api-staging.herokuapp.com'
  }
}

module.exports = OAuth2ProtocolBase
