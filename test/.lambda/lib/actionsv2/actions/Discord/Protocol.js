const OAuth2ProtocolBase = require('../../base/OAuth2ProtocolBase')

class DiscordProtocolHelper extends OAuth2ProtocolBase {
  static get authorizationUrl() {
    return 'https://discord.com/api/oauth2/authorize'
  }

  static get tokenUrl() {
    return 'https://discord.com/api/oauth2/token'
  }

  static clientId(config) {
    return config.client_id
  }

  static clientSecret(config) {
    return config.client_secret
  }

  static scope(config) {
    return 'bot'
  }

  static prepareAuthorizationUrl(config, url) {
    url.searchParams.set('permissions', '2048') // send messages
  }

  static prepareAccessTokenRequest(config, req, params) {
    params.set('client_secret', this.clientSecret(config))
  }
}

module.exports = DiscordProtocolHelper
