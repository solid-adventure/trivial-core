const ShopifyOAuth2ActionBase = require('../ShopifyOAuth2ActionBase')

class CreateFulfillmentAction extends ShopifyOAuth2ActionBase {
  async perform() {
    const res = await this.fetchWithAuth(
      `https://${this.config.shopify.shop_domain}.myshopify.com/admin/api/2021-10/orders/${this.inputValue.order_id}/fulfillments.json`,
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({fulfillment: this.inputValue})
      }
    )

    this.setHTTPResponseOutput(res, await res.json())

    return true
  }
}

module.exports = CreateFulfillmentAction 