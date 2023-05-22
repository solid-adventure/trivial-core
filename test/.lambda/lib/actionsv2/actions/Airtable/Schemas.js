const {
    schema,
    arrayOf
  } = require('../../../schema-utils')

  //due to the airtable fields name vary in different tables, so left this fields{}
  const Airtablefield = schema({fields: {
  }})
  
  const AirtableRecord = schema({fields: {
    id: {type: String, required: true, example:"recwDj0ARdLadzUMf"},
    fields: {type:arrayOf(Airtablefield), required:true}
    }})    

    
  module.exports.AirtableListRecords = schema({fields: {
      filterByFormula: {type: String, required: false, placeholder:'`AND({Field 1}, {Field 2})`'},
      maxRows: {type: Number, required: false, placeholder:'300'}
  }})

  module.exports.AirtableRecords = schema({fields: {
    records: {type: arrayOf(AirtableRecord), required: true, example:"[{'id':'abc','fields':{'Field Name': 'Field content'}}]"}
  }})

  const AirtableCreateRecord = schema({fields: {
    fields: {type:arrayOf(Airtablefield), required:true}
    }})

  module.exports.AirtableCreateRecords = schema({fields: {
    records: {type: arrayOf(AirtableCreateRecord), required: true, example:"[{'fields':{'Field Name': 'Field content', 'Field Note': 'Field note'}}]"}

  }})

  
