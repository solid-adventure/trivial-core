const {
    schema,
  } = require('../../../schema-utils')

module.exports.AppRunner = schema({fields: {
  app_id: {type: String, required: true, example:"`57e56bb7c751fa`", placeholder:"57e56bb7c751fa", help:"The ID of the Trivial app that will run."},
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

