const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const SendSMS = require('../../../../../../lib/actionsv2/actions/Twilio/SendSMS/Action')

describe('Twilio/SendSMS', () => {

    describe('.perform', () => {
        let account_sid = 'ACa79ee75f17bc7b9b7b6c8c3eb8eee897'
        let auth_token = '94f1b6744d8d4edc19ea92d71c452c35'
        let From = '+15005550006'
        let To = '+13233372032'
        let Body = 'Sample Text'
        let payload = { Body, To, From }
        let url_encoded_params = new URLSearchParams()
        for(let [key,value] of Object.entries(payload)){
            url_encoded_params.append(`${key}`, `${value}`)
        }
        let config = { twilio: { account_sid, auth_token } }
        let input = new ActionInput({config, values: {payload}})
        let action = new SendSMS(input)
        action.fetch = fetchStub()

        before (async () => await action.perform())

        it ('calls the Messages endpoint', () => {
            expect(action.fetch).to.have.been.calledOnceWith(
              `https://api.twilio.com/2010-04-01/Accounts/${account_sid}/Messages.json`
            )
        })

        it('performs a post', () => {
            expect(action.fetch).to.have.been.calledOnceWith(match.string, match({method: 'POST'}));
        })

        it('authorizes with the account sid and auth key', () => {
            expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
              headers: match({'authorization' : `Basic ${Buffer.from(account_sid + ':' + auth_token).toString('base64')}`})
            }))
        })

        it('sends the payload as the body in url encoded format', () => {
            expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
              body: url_encoded_params.toString()
            }))
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