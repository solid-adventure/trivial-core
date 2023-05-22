const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const GetOrdersCountAction = require('../../../../../../lib/actionsv2/actions/Whiplash/GetOrdersCount/Action')


describe('Whiplash/GetOrdersCount', () => {

  describe('.perform with search', () => {
    let payload = {
      search: '{"email_eq": "customer@gmail.com"}',
    }
    let config = {
      whiplash: {
        scope: 'manage_users',
        api_key: 'g45s6gds',
        api_secret_key: 'fds54g6dsh',
        code_grant: {token_type: 'bearer', access_token: '4f5da6gsd6' }
      }
    }
    let input = new ActionInput({config, values: {payload}})
    let action = new GetOrdersCountAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('calls the orders/count endpoint', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
          'https://www.getwhiplash.com/api/v2/orders/count?search=%7B%22email_eq%22%3A+%22customer%40gmail.com%22%7D'
        )
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
