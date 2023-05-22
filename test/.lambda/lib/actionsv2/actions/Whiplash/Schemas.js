const {
    schema,
    arrayOf
  } = require('../../../schema-utils')

    module.exports.GetOrders = schema({fields: {
    search: {type: String, required: false, example:"`{\"email_eq\": \"customer@gmail.com\"}`", placeholder:"`{\"email_eq\": \"customer@gmail.com\"}`", help:"https://help.whiplash.com/hc/en-us/articles/360050407332-Searching-in-the-V2-API"},
    originatorId: {type: String, required: false, example:"`1234ABC`", placeholder:"`1234ABC`", help:"https://developers.getwhiplash.com/api.v2.html#tag/originators"},
    id: {type: Number, required: false, example:"1234", placeholder:"1234", help:"ID cannot be used with search or originatorId"},
    }})

    module.exports.GetOrdersCount = schema({fields: {
    search: {type: String, required: false, example:"`{\"email_eq\": \"customer@gmail.com\"}`", placeholder:"`{\"email_eq\": \"customer@gmail.com\"}`", help:"https://help.whiplash.com/hc/en-us/articles/360050407332-Searching-in-the-V2-API"}
    }})

    module.exports.Generic = schema({fields: {
    path: {type: String, required: true, example:"`/orders/count`", placeholder:"`/orders/count`"},
    method: {type: String, required: true, example: '`GET`'}
    }})


    module.exports.AccountTransactionItem = schema({fields: {
    amount: {type: Number, required: true, example: 1.99, placeholder: '1.99'},
    income_account: {type: String, required: true, example: '`pack`', placeholder: '`pack`'},
    }})

    module.exports.OrderFees = schema({fields: {
    pick: {type: Number, required: true, example: '0.25', placeholder: '0.25'},
    pack: {type: Number, required: true, example: '2.75', placeholder: '2.75'},
    packaging: {type: Number, required: true, example: '0.0', placeholder: '0.0'},
    }})


    module.exports.AccountTransaction = schema({fields: {
    account_id: {type: Number, required: true, example:"1", placeholder:"1"},
    customer_id: {type: Number, required: true, example: `event.customer_id`, placeholder: '1'},
    amount: {type: Number, required: true, example: 1.99, placeholder: '1.99'},
    currency: {type: String, required: true, example: '`USD`', placeholder: '`USD`'},
    income_account: {type: String, required: true, example: '`pack`', placeholder: '`pack`'},
    description: {type: String, required: true, example: '`Shipped, #${event.reference_object.type} #${event.reference_object.id}`', placeholder: '`Order Shipped`'}
    // TODO AccountTransactionItems
    }})