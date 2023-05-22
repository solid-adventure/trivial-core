const ShopifyOAuth2DescriptorBase = require('../ShopifyOAuth2DescriptorBase')

class CreateFulfillmentDescriptor extends ShopifyOAuth2DescriptorBase {
  get fullDescriptionHTML() {
    // todo update description html
      return `This action creates fulfillments for Shopify stores.
      <h2>Overview</h2>
      To use this action, you'll make a custom application for your Shopify store.<br />
      Then, you'll be able to save tracking numbers to shopify orders and mark them as fulfilled.
      <h2>You Will Need</h2>
      <ul>
      <li>A <a target="_blank" href= "https://www.shopify.com/partners">Shopify Partners account</a></li>
      <li>Admin privileges on a Shopify store</li>
      <li> This redirect URL: ${this.oauth2RedirectUrl}</li>
      </ul>`
  }

  get expectedTypeName(){
    return 'ShopifyCreateFulfillment'
  }
}

module.exports = CreateFulfillmentDescriptor 