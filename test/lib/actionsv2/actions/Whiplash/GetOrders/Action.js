const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const GetOrdersAction = require('../../../../../../lib/actionsv2/actions/Whiplash/GetOrders/Action')


describe('Whiplash/GetOrders', () => {
  describe('.perform with originator', () => {
    let payload = {
      originatorId: '4214154981234',
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
    let action = new GetOrdersAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('calls the orders/originator endpoint', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
          'https://www.getwhiplash.com/api/v2/orders/originator/4214154981234'
        )
      })
  })

  describe('.perform with id', () => {
    let payload = {
      id: '1234',
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
    let action = new GetOrdersAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('calls the orders/:id endpoint', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
          'https://www.getwhiplash.com/api/v2/orders/1234'
        )
      })
  })

  describe('.perform with page', () => {
    let payload = {
      page: '66',
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
    let action = new GetOrdersAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('calls the orders/:id endpoint', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
          'https://www.getwhiplash.com/api/v2/orders?page=66'
        )
      })
  })

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
    let action = new GetOrdersAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('calls the orders/:id endpoint', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
          'https://www.getwhiplash.com/api/v2/orders?search=%7B%22email_eq%22%3A+%22customer%40gmail.com%22%7D'
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
