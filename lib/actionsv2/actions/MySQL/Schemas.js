const {
    schema,
  } = require('../../../schema-utils')

module.exports.MySQLQuery = schema({fields: {
  query: {type: String, required: true, example:"`SELECT * FROM TABLE`", placeholder:"`SELECT * FROM TABLE`", editorComponent: 'AceEditor', editorOptions: {height: '300px', lang: 'sql'}}
  }})