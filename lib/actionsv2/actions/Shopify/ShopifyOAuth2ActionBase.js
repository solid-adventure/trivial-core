const OAuth2ActionBase = require('../../base/OAuth2ActionBase')

class ShopifyOAuth2ActionBase extends OAuth2ActionBase {
    async fetchWithAuth(...args){ return await this.fetchWithAuthBearer(...args) }

    async fetchWithAuthBearer(...args){
      if (! args[1]) {
        args[1] = {}
      }
      if (! args[1].headers) {
        args[1].headers = {}
      }
      args[1].headers['X-Shopify-Access-Token'] = `${this.config.shopify.code_grant.access_token}`
      return await this.fetch(...args)
    }

    static get redactPaths(){
      return ['*.headers["X-Shopify-Access-Token"]']
    }
}
module.exports = ShopifyOAuth2ActionBase 