const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const UpsertAction = require('../../../../../../lib/actionsv2/actions/PostgreSQL/Upsert/Action')


describe('PostgreSQL/Upsert', () => {

  describe('queryString', () => {

    it ('creates an insert statement', () => {
      let config = {}
      let rows = [
        {
          name: "James",
          age: 22,
          platform: 'shopify',
          platform_id: 123
        },
        {
          name: null,
          age: 23,
          platform: 'shopify',
          platform_id: 456
        }
      ]
      let payload = {tableName: "products", uniquenessKey: "platform, platform_id", rows: rows}
      let input = new ActionInput({config, values: {payload}})
      let action = new UpsertAction(input)
      expect(action.queryString).to.eql("INSERT INTO \"products\" (\n  \"name\",\n  \"age\",\n  \"platform\",\n  \"platform_id\"\n  )\nVALUES\n('James',22,'shopify',123),(null,23,'shopify',456)\n\nON CONFLICT(platform, platform_id)\nDO UPDATE\nSET \n  \"name\" = EXCLUDED.\"name\",\n  \"age\" = EXCLUDED.\"age\"\n;\n")
    })

  })

})


