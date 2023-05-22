const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const CreateFulfillmentAction = require('../../../../../../lib/actionsv2/actions/Shopify/CreateFulfillment/Action')

describe('Shopify/CreateFulfillmentAction', () => {

  describe('.perform', () => {
    let payload = {
      order_id: '4214154981234',
      location_id: 61510681234,
      tracking_number: '123456789',
      tracking_urls: ['https://shipping.xyz/track?num=123456789'],
      notify_customer: false
    }
    let config = {
      shopify: {
        scope: 'write_orders',
        shop_domain: 'test-site',
        api_key: 'g45s6gds',
        api_secret_key: 'fds54g6dsh',
        code_grant: {access_token: '4f5da6gsd6'}
      }
    }
    let input = new ActionInput({config, values: {payload}})
    let action = new CreateFulfillmentAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('calls the fulfillments endpoint', () => {
        expect(action.fetch).to.have.been.calledOnceWith(
          `https://${config.shopify.shop_domain}.myshopify.com/admin/api/2021-10/orders/${payload.order_id}/fulfillments.json`
        );
    })
    it('performs a post', () => {
        expect(action.fetch).to.have.been.calledOnceWith(match.string, match({method: 'POST'}));
    })
  
    it('sets the content type to JSON', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        headers: match({'content-type': 'application/json'})
      }))
    })
  
    it('authorizes with the access token', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        headers: match({'X-Shopify-Access-Token': `${config.shopify.code_grant.access_token}`})
      }))
    })
  
    it('sends the fulfillment object as the body', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        body: JSON.stringify({fulfillment:payload})
      }))
    })
  
    it('outputs the HTTP response', () => {
      expect(action.output.outputValues().payload).to.eql({
        status: 200, body: {}, headers: {}
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
  