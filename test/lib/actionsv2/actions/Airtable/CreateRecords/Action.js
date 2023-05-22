const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const CreateRecordsAction = require('../../../../../../lib/actionsv2/actions/Airtable/CreateRecords/Action')


describe('Airtable/CreateRecords', () => {

  describe('.perform', () => {
    let payload = {}

    let config = { airtable: {
      api_key : 'testapikey',
      base_id : 'test_base_id',
      table_name: 'Table 1'
    }}

    let input = new ActionInput({config, values: {payload}})
    let action = new CreateRecordsAction(input)
    action.fetch = fetchStub({"records":[{'fields':{'Field Name': 'Field content', 'Field Note': 'Field note'}}]})

    before (async () => await action.perform())

    it ('calls the table endpoint', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
        `https://api.airtable.com/v0/${config.airtable.base_id}/${encodeURIComponent(config.airtable.table_name)}`
      )
    })

    it('performs a post', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({method: 'POST'}));
    })

    it('authorizes with the api key', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        headers: match({'Authorization': `Bearer ${config.airtable.api_key}`})
      }))
    })

    it('sets the content type to JSON', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        headers: match({'Content-Type': `application/json`})
      }))
    })

    it('sends the payload as the records body', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        body: JSON.stringify(payload)
      }))
    })

    it('outputs the HTTP response', () => {
      expect(action.output.outputValues().payload).to.eql({
        status: 200, body: {"records":[{'fields':{'Field Name': 'Field content', 'Field Note': 'Field note'}}]}, headers: {}
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
