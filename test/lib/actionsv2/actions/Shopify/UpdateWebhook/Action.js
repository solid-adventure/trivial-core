const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const UpdateWebhookAction = require('../../../../../../lib/actionsv2/actions/Shopify/UpdateWebhook/Action')

describe('Shopify/UpdateWebhookAction', () => {

  describe('.perform', () => {
    let payload = {
      id: '42g34s56gs',
      address: 'https://new-site.trivialapps.io/webhooks/receive',
    }
    let config = {
      shopify: {
        scope: 'read_products',
        shop_domain: 'test-site',
        api_key: 'g45s6gds',
        api_secret_key: 'fds54g6dsh',
        code_grant: {access_token: '4f5da6gsd6'
        }
      }
    }
    let input = new ActionInput({config, values: {payload}})
    let action = new UpdateWebhookAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('calls the webhooks endpoint', () => {
        expect(action.fetch).to.have.been.calledOnceWith(
          `https://${config.shopify.shop_domain}.myshopify.com/admin/api/2021-10/webhooks/${payload.id}.json`
        );
    })
    it('performs a put', () => {
        expect(action.fetch).to.have.been.calledOnceWith(match.string, match({method: 'PUT'}));
    })
  
    it('sets the content type to JSON', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        headers: match({'content-type': 'application/json'})
      }))
    })
  

    it('sends the webhook object as the body', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        body: JSON.stringify({webhook:payload})
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
  