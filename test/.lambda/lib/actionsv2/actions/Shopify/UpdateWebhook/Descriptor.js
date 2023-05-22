const ShopifyOAuth2DescriptorBase = require('../ShopifyOAuth2DescriptorBase')

class UpdateWebhookDescriptor extends ShopifyOAuth2DescriptorBase {
  get fullDescriptionHTML() {
      return `This action updates an existing webhook for Shopify stores.
      <p>
      <em>Note: <strong>topic</strong> cannot be updated. To change the topic, delete the webhook and create a new one.</em>
      </p>
      <h2>Overview</h2>
      To use this action, you'll use the same custom application for your Shopify store that you used to create your webhook.
      <h2>You Will Need</h2>
      <ul>
        <li>A custom Shopify app that has at least one webhhook installed previously</li>
      </ul>`
    }
  
  get expectedTypeName(){
    return 'ShopifyUpdateWebhook'
  }

}

module.exports = UpdateWebhookDescriptor 