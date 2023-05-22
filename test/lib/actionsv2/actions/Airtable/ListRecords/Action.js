const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const ListRecordsAction = require('../../../../../../lib/actionsv2/actions/Airtable/ListRecords/Action')


describe('Airtable/ListRecords', () => {

  describe('.perform', () => {
    let payload = {
      filterByFormula: `AND({Order} = "V0", {Label} = "False")`
    }

    let config = { airtable: {
      api_key : 'testapikey',
      base_id : 'test_base_id',
      table_name: 'Table 1'
    }}

    let url_encoded_params = new URLSearchParams();
    for(let [key, value] of Object.entries(payload)){
      url_encoded_params.append(`${key}`, `${value}`)
    }

    let input = new ActionInput({config, values: {payload}})
    let action = new ListRecordsAction(input)
    action.fetch = fetchStub({"records":[{"id":"a"},{"id":"b"}]})

    before (async () => await action.perform())

    it ('calls the messages endpoint', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
        `https://api.airtable.com/v0/${config.airtable.base_id}/${encodeURIComponent(config.airtable.table_name)}?${url_encoded_params.toString()}`
      )
    })

    it('performs a get', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({method: 'GET'}));
    })

    it('authorizes with the api key', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        headers: match({'Authorization': `Bearer ${config.airtable.api_key}`})
      }))
    })

    it('outputs the HTTP response', () => {
      expect(action.output.outputValues().payload).to.eql({
        status: 200, body: {"count": 2, "records":[{"id":"a"},{"id":"b"}]}, headers: {}
      })
    })
  })
})

function fetchStub(data = {}) {
    let response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {},
      json: sinon.stub().resolves(data)
    }
    return sinon.stub().resolves(response)
}
