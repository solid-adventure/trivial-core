const { schema, arrayOf } = require('../../../schema-utils');

let shipCoShipment = schema({fields:{
  to_address: {type: Object, required: true, example: `{
    "full_name": "John Doe",
    "company": "",
    "email": "",
    "phone": "0901231234",
    "country": "US",
    "zip": "90071",
    "province": "CA",
    "city": "Los Angeles",
    "address1": "630 W 5th St",
    "address2": ""
  }`},
  from_address: {type: Object, required: true, example: `{
    "full_name": "Yamada Taro",
    "company": "World Company",
    "email": "ytaro@worldcompany.com",
    "phone": "08012341234",
    "country": "US",
    "zip": "90071",
    "province": "CA",
    "city": "Los Angeles",
    "address1": "630 W 5th St",
    "address2": ""
  }`},
  parcels: {type: arrayOf(Object), required:true, example: `[
    {
      "amount": "1",
      "width": "10",
      "height": "10",
      "depth": "10",
      "weight": 2000
    }
  ]`},
  products: {type: arrayOf(Object), required:true, example: `[
    {
      "name": "T-Shirt",
      "quantity": 2,
      "price": 2980,
      "hs_code": "1234.12",
      "origin_country": "JP"
    }
  ]`},
  customs: {type: Object, required: true, example: `{
    "duty_paid": false,
    "content_type": "MERCHANDISE"
  }`},
  setup: {type: Object, required: true, example: `{
    "carrier": "ups",
    "service": "ups_ground",
    "currency": "USD",
    "insurance": 0,
    "ref_number": "123-REF-3456",
    "discount": 0,
    "signature": false,
    "test": true,
    "return_label": false
  }`}
}})

module.exports.CreateShipCoShipment = shipCoShipment
module.exports.CreateShipCoRate = shipCoShipment

module.exports.ListShipCoShipments = schema({
  fields: {
    scope: {
      type: String,
      required: true,
      example: "`all`",
      allowed: ["all", "api"],
    },
    state: {
      type: String,
      required: false,
      example: "`active`",
      allowed: ["active", "void", "any"],
    },
    carrier: { type: String, required: false, example: "`ups`" },
    limit: { type: String, required: false, example: "`50`" },
    page: { type: String, required: false, example: "`1`" },
    created_after: {
      type: String,
      required: false,
      example: "`2018-09-20T00:00:00.000Z`",
    },
    created_before: { type: String, required: false, example: "`today`" },
  },
});
