const {
    schema,
    RequiredString, 
    OptionalString,
    arrayOf
} = require('../../../schema-utils')

module.exports.ShopifyCreateFulfillment = schema({fields: {
  order_id: {type:String, required: true},
  location_id: {type: Number, required: true},
  tracking_number: {type: String, required: true, example: "`123456789`"},
  tracking_urls: {type: arrayOf(String), required: true, example: "['https:\/\/shipping.xyz\/track.php?num=123456789','https:\/\/anothershipper.corp\/track.php?code=abc']"},
  notify_customer: {type: Boolean, required: true, example: "true"}
}})

module.exports.ShopifyWebhook = schema({fields: {}})

module.exports.ShopifyWebhookId = schema({fields: {
    id: {type: String, required: true, example: "`7961848729`"}
}})

module.exports.ShopifyUpdateWebhook = schema({fields: {
    address: {type: String, required: true, example:"`https://YOUR-TRIVIAL-APP-ID.trivialapps.io/webhooks/receive`"},
    format: OptionalString,
    id: {type: String, required: true, example: "`7961848729`"}
}})

module.exports.ShopifyCreateWebhook = schema({fields: {
    address: {type: String, required: true, example:"`https://YOUR-TRIVIAL-APP-ID.trivialapps.io/webhooks/receive`"},
    format: OptionalString,
    topic: OptionalString,
}})