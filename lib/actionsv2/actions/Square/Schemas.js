const {
    schema,
    arrayOf
  } = require('../../../schema-utils')


const queryExample = `{
    "filter": {
      "date_time_filter": {
        "closed_at": {
          "start_at": "2018-03-04T21:54:45+00:00",
          "end_at": "2019-03-04T21:54:45+00:00"
        }
      },
      "state_filter": {
        "states": [
          "COMPLETED"
        ]
      }
    },
    "sort": {
      "sort_field": "CLOSED_AT",
      "sort_order": "DESC"
    }
  }`

const exampleWithLocationIds = `{
    "location_ids": ['L4HFH9QET2XB6'],
    "filter": {
      "date_time_filter": {
        "closed_at": {
          "start_at": "2018-03-04T21:54:45+00:00",
          "end_at": "2019-03-04T21:54:45+00:00"
        }
      },
      "state_filter": {
        "states": [
          "COMPLETED"
        ]
      }
    },
    "sort": {
      "sort_field": "CLOSED_AT",
      "sort_order": "DESC"
    }
  }`

module.exports.GenericSquare = schema({fields: {
	baseURL: { type: String, required: true, example: "`https://connect.squareup.com/v2`" , placeholder: "`https://connect.squareup.com/v2`" },
	path: { type: String, required: true, example: "`/orders/search`" , placeholder: "`/team-members/{team_member_id}`" },
	method: { type: String, required: true, example: '`POST`' },
  recordType: { type: String, required: false, example: '`orders`'},
	searchParams: { type: Object, required: false},
	body: { type: Object, required: false, example: exampleWithLocationIds, placeholder: exampleWithLocationIds }
	}})

module.exports.SquareGetOrders = schema({fields: {
  location_ids: {type: arrayOf(String), required: true, example: "['L4HFH9QET2XB6']",  placeholder: "['L4HFH9QET2XB6']"},
  query: {type: Object, required: false, example: queryExample, placeholder: queryExample}
  }})


module.exports.SquareGetCatalog = schema({fields: {
  types: {type: arrayOf(String), required: false, example: "['CATEGORY', 'MODIFIER']", placeholder:  "['CATEGORY', 'MODIFIER']"},
  maxRows: {type: Number, required: false, example: 300, placeholder: 300} 
  }})
