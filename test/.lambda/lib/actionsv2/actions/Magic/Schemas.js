const {
    schema,
    arrayOf
  } = require('../../../schema-utils')

  
module.exports.MagicQuery = schema(
  {
    fields: {
      query: {
        type: String,
        required: true,
        example:"`SELECT * FROM your_table_name`",
        placeholder:"`SELECT * FROM your_table_name`",
        label: "",
        deletable: false,
        editorComponent: 'AceEditor',
        editorOptions: {
          height: '300px',
          lang: 'sql',
          previewHelper: 'QueryHelper',
          suggestionManager: 'QuerySuggestionManager'
        }
      }
    }
  }
)
