const OAuth2ProtocolBase = require('../../base/OAuth2ProtocolBase')

class ShopifyOAuth2ProtocolBase extends OAuth2ProtocolBase {
    static get authorizationUrl() {
      return `https://myshopify.com/admin/oauth/authorize`
    }

    static get tokenUrl() {
      return `https://myshopify.com/admin/oauth/access_token`
    }

    static clientId(config) {
      return config.api_key
    }

    static clientSecret(config) {
      return config.api_secret_key
    }

    static scope(config) {
      return `${config.scope}`
    }

    static prepareAuthorizationUrl(config, url) {
      url.hostname = `${config.shop_domain}.myshopify.com`
      url.searchParams.set('access_mode', 'per-user')
      url.searchParams.set('nonce', url.searchParams.get('state'))
    }

    static prepareAccessTokenRequest(config, req, params) {
      params.set('client_secret', this.clientSecret(config))
    }

    static buildAccessTokenRequest(config, req, redirect) {
      const [baseUrl, options] = super.buildAccessTokenRequest(config, req, redirect)
      const url = new URL(baseUrl)
      url.hostname = `${config.shop_domain}.myshopify.com`
      return [url.href, options]
    }
}
module.exports = ShopifyOAuth2ProtocolBase