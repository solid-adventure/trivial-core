const {
  schema,
} = require('../../../schema-utils')

module.exports.GenericArka = schema({
  fields: {
    baseURL: { type: String, required: true, example: "`https://api-dev.arka.com/v1`", placeholder: "`https://api-dev.arka.com/v1`" },
    path: { type: String, required: true, example: "`/orders`", placeholder: "`/orders`" },
    method: { type: String, required: true, example: '`GET`' },
    searchParams: { type: Object, required: false, example: `{"limit": "2"}` },
    body: { type: Object, required: false, example: '`{}`', editorComponent: 'AceEditor', editorOptions: {height: '300px', lang: 'javascript'} }
  }
})