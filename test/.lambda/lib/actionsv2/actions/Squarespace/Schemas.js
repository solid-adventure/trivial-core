const {
    schema,
  } = require('../../../schema-utils')

  module.exports.SquarespaceGetOrders = schema({fields: {
    modifiedAfter: {type: String, required: false, example:"`2022-08-01T00:00:00.sZ`", placeholder:"YYYY-MM-DDThh:mm:ss.sZ", help:"Must be an ISO 8601 UTC date and time string"},
    modifiedBefore: {type: String, required: false, example:"`2022-08-01T00:00:00.sZ`", placeholder:"YYYY-MM-DDThh:mm:ss.sZ", help:"Must be an ISO 8601 UTC date and time string"},
    fulfillmentStatus: {type: String, required: false, example:"`FULFILLED`", placeholder:"`FULFILLED`", help:"Must be PENDING, FULFILLED, or CANCELED"},
    maxRows: {type: Number, required: false, example:"300", placeholder:"300"}
    }})
