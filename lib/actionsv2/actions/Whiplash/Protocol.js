const OAuth2ProtocolBase = require('../../base/OAuth2ProtocolBase')

class WhiplashProtocolHelper extends OAuth2ProtocolBase {
  static get authorizationUrl() {
    return 'https://www.getwhiplash.com/oauth/authorize'
  }

  static get tokenUrl() {
    return 'https://www.getwhiplash.com/oauth/token'
  }

  static clientId(config) {
    return config.client_id
  }

  static clientSecret(config) {
    return config.client_secret
  }

  static refreshToken(config) {
    return config.code_grant.refresh_token
  }

  static scope(config) {
    return 'user_manage'
  }

  static buildAccessTokenRequest(config, req, redirect) {
    return [
      this.tokenUrl,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: this.buildAccessTokenRequestBody(config, req, redirect)
      }
    ]
  }

  static buildAccessTokenRequestBody(config, req, redirect) {
    let body = {}
    body.grant_type = 'authorization_code'
    body.code = req.query.code
    body.redirect_uri = redirect
    body.client_id = this.clientId(config)
    body.client_secret = this.clientSecret(config)
    body.scope = this.scope(config)
    return JSON.stringify(body)
  }

  static buildRefreshTokenRequest(config, req, redirect) {
    return [
      this.tokenUrl,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: this.buildRefreshTokenRequestBody(config, req, redirect)
      }
    ]
  }

  static buildRefreshTokenRequestBody(config, req, redirect) {
    let body = {}
    body.grant_type = 'refresh_token'
    body.refresh_token = this.refreshToken(config)
    body.client_id = this.clientId(config)
    body.client_secret = this.clientSecret(config)
    return JSON.stringify(body)
  }

}

module.exports = WhiplashProtocolHelper
