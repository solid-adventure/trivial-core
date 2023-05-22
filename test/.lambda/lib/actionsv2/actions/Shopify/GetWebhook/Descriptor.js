const ShopifyOAuth2DescriptorBase = require('../ShopifyOAuth2DescriptorBase')

class GetWebhookDescriptor extends ShopifyOAuth2DescriptorBase {
  get fullDescriptionHTML() {
    return `This action fetches an individual webhook for Shopify stores.
    <h2>Overview</h2>
    To use this action, you'll use the same custom application for your Shopify store that you used to create your webhook.
    <h2>You Will Need</h2>
    <ul>
    <li>A custom Shopify app that has installed a webhook previously</li>
    </ul>`
}

  get expectedTypeName(){
    return 'ShopifyWebhookId'
  }
  
}

module.exports = GetWebhookDescriptor 