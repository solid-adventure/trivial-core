const OAuth2DescriptorBase = require('../../base/OAuth2DescriptorBase')

class ShopifyOAuth2DescriptorBase extends OAuth2DescriptorBase {
    get iconUrl() {
      return '/assets/images/action-icons/shopify.svg'
    }

    get expectedTypeName() {
      return 'ShopifyWebhook'
    }


    getCredentialTypes(){
      return {
        shopify: {type: 'ShopifyCredentials', required: true}
      }
    }

}
module.exports = ShopifyOAuth2DescriptorBase  