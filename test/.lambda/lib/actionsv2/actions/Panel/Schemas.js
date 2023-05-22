const {
    schema,
    arrayOf
  } = require('../../../schema-utils')


  
const PanelHeadline = schema({fields: {
  count: {type: String, required: true, example:"23", placeholder:"23"},
  title: {type: String, required:true}
  }})    
module.exports.PanelHeadline = PanelHeadline


module.exports.CrateLabel = schema({fields: {
  appName: {type: String, required: true, example:"`App Name`", placeholder:"`App Name`"},
  header: {type: String, required: true, example:"`Header Text`", placeholder:"Header text"},
  disclaimer: {type: String, required: true, example:"`Disclaimer text`", placeholder:"Disclaimer text"},
  footerLabel: {type: String, required: true, example:"`Footer label`", placeholder:"Footer label"},
  footerText: {type: String, required: true, example:"`Footer text`", placeholder:"Footer text"},
  headlines: {type: arrayOf(PanelHeadline), required: true, example: "[{count: 23, title: 'Headline title'}]" }
  }})    


module.exports.TableView = schema({fields: {
  rows: {type: arrayOf(Array), required: true, example: `[[1,2,3], ['a', 'b', 'c']]`},
  columnNames: {type: arrayOf(String), required: true, example: `['Col1', 'Col2', 'Col3']`}
  }})    

module.exports.Spreadsheet = schema({fields: {
  rows: {type: arrayOf(Array), required: true, example: `[[1,2,3], ['a', 'b', 'c']]`},
  columnNames: {type: arrayOf(String), required: true, example: `['Col1', 'Col2', 'Col3']`}
  }})   