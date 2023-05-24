const {
    schema,
    arrayOf
  } = require('../../../schema-utils')

  const {{service}}Field = schema({fields: {
  }})
  
  module.exports.{{service}}Record = schema({fields: {
    id: {type: String, required: true, example:"this will be prefilled", placeholder:"shadow text when empty", help:"Tooltip on what to enter here."},
    fields: {type:arrayOf({{service}}Field), required:true}
    }})    


// To make these definitions available to your action, you must add references to this file in
// source/lib/TrivialSchemas.js

// Add this line:
// const {{service}} = require('./actionsv2/actions/{{service}}/Schemas')

// And this to the TrivialSchemas definition:
//   ...{{Service}},
