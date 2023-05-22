const OAuth2ProtocolBase = require('../../base/OAuth2ProtocolBase')

class {{Service}}ProtocolHelper extends OAuth2ProtocolBase {
  static get authorizationUrl() {
    return 'https://authorization-url-for-this-service.com/'
  }

  static get tokenUrl() {
    return 'https://token-url-for-this-service.com/oauth/token'
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
    return ''
  }

  // below are helper endpoints for listing and adding sheets from the builder UI

  // static get refreshEnabled() {
  //   return true
  // }

  // static async performListSheets(protoReq) {
  //   const url = new URL('https://www.googleapis.com/drive/v3/files')
  //   url.searchParams.set('q', "mimeType='application/vnd.google-apps.spreadsheet'")
  //   url.searchParams.set('fields', 'nextPageToken, files(id, name)')
  //   const res = await this.fetchWithAuth(protoReq, url.href)
  //   if (!res.ok)
  //     throw new Error(res.statusText)
  //   return await res.json()
  // }

}

module.exports = {{Service}}ProtocolHelper
