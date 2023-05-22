const OAuth2ProtocolBase = require('../../base/OAuth2ProtocolBase')

class SquareProtocolHelper extends OAuth2ProtocolBase {
  static get authorizationUrl() {
    return `https://connect.squareup.com/oauth2/authorize`
  }

  static get api_version() {
    return '2022-08-23'
  }

  static get tokenUrl() {
    return 'https://connect.squareup.com/oauth2/token'
  }

  static clientId(config) {
    return config.application_id
  }

  static clientSecret(config) {
    return config.application_secret
  }

  static get refreshEnabled() {
    return true
  }

  static refreshToken(config) {
    return config.code_grant.refresh_token
  }

  static scope(config) {
    return config.application_scope
  }

  static buildAuthorizationUrl(config, state, redirect) {
    const url = new URL(this.authorizationUrl)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', this.clientId(config))
    url.searchParams.set('redirect_uri', redirect)
    url.searchParams.set('state', state)
    url.searchParams.set('session', 'false')
    let url_string = url.href
    //  Square expects literal + signs in the scope atttribute, so we append after the url is stringified
    return `${url_string}&scope=${this.scope(config)}`
  }

  static buildAccessTokenRequest(config, req, redirect) {
    let url = new URL(this.tokenUrl)
    let out = [
      url,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Square-Version': this.api_version
        },
        body: JSON.stringify({
          client_id: this.clientId(config),
          client_secret: this.clientSecret(config),
          grant_type: 'authorization_code',
          code: req.query.code,
          redirect_uri: redirect
        })
      }
    ]
    return out
  }

  static buildRefreshTokenRequest(config, logger) {
    let url = new URL(this.tokenUrl)
    return [
      url,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Square-Version': this.api_version
        },
        body: JSON.stringify({
          client_id: this.clientId(config),
          client_secret: this.clientSecret(config),
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken(config)
        })
      }
    ]
  }


}

module.exports = SquareProtocolHelper
