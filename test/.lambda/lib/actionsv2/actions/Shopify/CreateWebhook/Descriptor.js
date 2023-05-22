const ShopifyOAuth2DescriptorBase = require('../ShopifyOAuth2DescriptorBase')

class CreateWebhookDescriptor extends ShopifyOAuth2DescriptorBase {
  get fullDescriptionHTML() {
      return `This action creates webhooks for Shopify stores.
      <h2>Overview</h2>
      To use this action, you'll make a custom application for your Shopify store.
      <br/>Then, you'll be able to create a webhook subscription to receive updates on a topic, such as <strong>orders/paid</strong> or <strong>products/create</strong>.
      <h2>You Will Need</h2>
      <ul>
      <li>A <a target="_blank" href= "https://www.shopify.com/partners">Shopify Partners account</a></li>
      <li>Admin privileges on a Shopify store
      </ul>`
  }

  get expectedTypeName(){
    return 'ShopifyCreateWebhook'
  }

  afterAdd({transform}) {
    transform.definition.transformations.push({
      from: "`products/create`", to: 'topic'
    },
    {
      from: "`json`", to: 'format'
    })
  }
}

module.exports = CreateWebhookDescriptor 