const OAuth2CredentialTypeBase = require('../../base/OAuth2CredentialTypeBase')

class ShopifyCredentials extends OAuth2CredentialTypeBase {
    getConfigFields() {
        return {
            scope: {type: String, required: true, example:"read_products, write_products"},
            shop_domain: {type: String, required: true},
            api_key: {type: String, required: true, secret: true},
            api_secret_key: {type: String, required: true, secret: true}
        }
    }

    showAuthorizeAction(config) {
      return config.api_key && config.api_secret_key
    }

    authorizeLabel(config) {
      return 'Add to Shop...'
    }

    reAuthorizeLabel(config) {
      return 'Re-Authorize Shop...'
    }

}
module.exports = ShopifyCredentials 