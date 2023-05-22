const ShopifyOAuth2ActionBase = require('../ShopifyOAuth2ActionBase')

class GetWebhooksAction extends ShopifyOAuth2ActionBase {
  async perform() {
    const res = await this.fetchWithAuth(
      `https://${this.config.shopify.shop_domain}.myshopify.com/admin/api/2021-10/webhooks.json`,
      {
        method: 'GET',
        headers: {'content-type': 'application/json'}
      }
    )

    this.setHTTPResponseOutput(res, await res.json())

    return true
  }
}

module.exports = GetWebhooksAction 