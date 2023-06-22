const {
    schema,
  } = require('../../../schema-utils')

const datastoreBaseFields = {
  hostname: {type: String, required: true, example: '`https://trivial-api.trivial.com`', placeholder: '`https://trivial-api.trivial.com`', help:"The hostname where Trivial records should be upserted."},
  records: {type: Object, required: true, example: "[{\"id\":22,\"name\":\"order\",\"value\":45,\"refunds\":[{\"id\":\"3432\",\"amount\":\"34.55\"}]}]", placeholder: "[{\"id\":22,\"name\":\"order\",\"value\":45,\"refunds\":[{\"id\":\"3432\",\"amount\":\"34.55\"}]}]", help:"List of data records that should be upserted into Trivial Datastore."},
  table_name: {type: String, required: true, example: '`square_orders`', placeholder: '`square_orders`', help: "Trivial Datastroe table name where records should be upserted"},
  unique_keys: {type: Object, required: true, example: "[\"id\",\"name\"]", placeholder: "[\"id\",\"name\"]", help: "Unique key names that should be used to determine when to update a record."},
  nested_tables: { type: Object, required: false,
    example: "{\"refunds\":{\"parent_key\":[{\"to\":\"order_id\",\"from\":\"id\"}],\"unique_keys\":[\"id\"]}}",
    placeholder: "{\"refunds\":{\"parent_key\":[{\"to\":\"order_id\",\"from\":\"id\"}],\"unique_keys\":[\"id\"]}}",
    help: "Create nested Trivial Datastore tables from a list of objects on the parent record."
  },
  customer_token: {type: String, required: false, example: '`customer_token`', placeholder: '`customer_token`', help: "Trivial customer token."},
}  

module.exports.AppRunner = schema({fields: {
  app_id: {type: String, required: true, example:"`57e56bb7c751fa`", placeholder:"57e56bb7c751fa", help:"The ID of the Trivial app that will run."},
  }})    

module.exports.DatastoreUpsert = schema({fields: datastoreBaseFields })

module.exports.DatastoreVerifyModel = schema({fields: {...datastoreBaseFields,
  apply_table_changes: {type: Boolean, required: false, example: 'true', placeholder: 'true', help: "If true, Trivial will apply any changes to the model that may have been made since the last time the model was altered."}
}})

module.exports.GenericObject = schema({fields: {}})

module.exports.HTTPResponse = schema({fields: {
  body: {type: module.exports.GenericObject, required: true, example: 'payload.body'},
  status: {type: Number, required: true, example: 'payload.status'}
}})

module.exports.TrivialClaimFreeShirt = schema({fields: {
  name: {type: String, required: true, placeholder: 'initialPayload.name'},
  email: {type: String, required: true, placeholder: '`you@gmail.com`'},
  address1: {type: String, required: true, placeholder: 'initialPayload.address1'},
  address2: {type: String, required: false, placeholder: 'initialPayload.address2'},
  city: {type: String, required: true, placeholder: 'initialPayload.city'},
  state: {type: String, required: true, placeholder: 'initialPayload.state'},
  zip: {type: String, required: true, placeholder: 'initialPayload.zip'},
  size: {type: String, required: true, placeholder: 'initialPayload.size', allowed: ['XS','S', 'M', 'L', 'XL', 'XXL' ]},
  color: {type: String, required: true, placeholder: 'initialPayload.color', allowed: ['Black', 'Silver']},
  country: {type: String, required: true, placeholder: 'initialPayload.country', allowed: ['US', 'CA']}
}})

module.exports.TrivialEmailMessage = schema({fields: {
  to: {type: String, required: true, example: "`example@example.test`"},
  subject: {type: String, required: true, example: "`Subject line`"},
  body: {type: String, required: true, example: "`The email body. \\n\\n It supports _some_ *formatting*.`"},
}})

module.exports.TrivialSMSMessage = schema({fields: {
  to: {type: String, required: true, example: "`+15105551000`"},
  message: {type: String, required: true, example: "`An example message`"}
}})

