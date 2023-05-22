const {
    schema,
    arrayOf
  } = require('../../../schema-utils')

  
  module.exports.Query = schema({fields: {
    query: {
      type: String,
      required: true,
      example:"`SELECT * FROM TABLE`",
      placeholder:"`SELECT * FROM TABLE`",
      editorComponent: 'AceEditor',
      editorOptions: {height: '300px', lang: 'sql'}
    }
    }})

 const UpsertRow = schema({fields: {}})  

  module.exports.Upsert = schema({fields: {
    tableName: {type: String, required: true, example:"`your_table_name`", placeholder:"`table_name`"},
    uniquenessKey: {type: String, required: true, example:"`platform, platform_id`", placeholder:"`platform, platform_id`"},
    rows: {type: arrayOf(UpsertRow), required: true, example: "[{name: 'Burt', platform: 'Shopify', platform_id: 123}, {name: 'Ernie', platform: 'Shopify', platform_id: 456}]", placeholder: "[{name: 'James', platform_id: 123}]"}
    }})

module.exports.DefaultSampleDatabaseName = 'sample-ecommerce-trivial-1680545100'     
module.exports.DefaultSampleConnection = {
  user: 'magicquery_ro',
  host: 'db.kovrvbhkfadarmcytmed.supabase.co',
  database: 'trivial-data-gen_production',
  password: 'jsGgj8Hu6xCGxzM',
  port: 5432,
  ssl: {
    rejectUnauthorized: false // TODO: set rejectUnauthorized to true for non-dev
  }
}    