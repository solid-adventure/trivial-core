const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const GenericAction = require('../../../../../../lib/actionsv2/actions/Whiplash/Generic/Action')


describe('Whiplash/Generic', () => {

  let config = {
    whiplash: {
      scope: 'manage_users',
      api_key: 'g45s6gds',
      api_secret_key: 'fds54g6dsh',
      code_grant: {token_type: 'bearer', access_token: '4f5da6gsd6' }
    }
  }

  describe('.perform with path', () => {
    let payload = {
      path: '/orders/count',
    }
    let input = new ActionInput({config, values: {payload}})
    let action = new GenericAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('calls the orders/originator endpoint', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
          'https://www.getwhiplash.com/api/v2/orders/count'
        )
      })
  })

  describe('.perform with method', () => {
    let payload = {
      path: '/orders/count',
      method: 'POST'
    }
    let input = new ActionInput({config, values: {payload}})
    let action = new GenericAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('applies the method correctly', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({method: 'POST'}));
    })

  })

  describe('.perform with params', () => {
    let payload = {
      path: '/orders/count',
      method: 'POST',
      name: 'bilbo'
    }
    let input = new ActionInput({config, values: {payload}})
    let action = new GenericAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('applies the params correctly', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
          'https://www.getwhiplash.com/api/v2/orders/count?name=bilbo'
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
