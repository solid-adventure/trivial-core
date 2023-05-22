const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))
const jwt = require('jsonwebtoken')

const ActionInput = require('../../../../../lib/actionsv2/ActionInput')
const SendEmailAction = require('../../../../../lib/actionsv2/actions/SendEmail/Action')

describe('SendEmail', () => {

  describe('.perform', () => {
    let appId = 'e3e04bc650e913fe'
    let apiKey = testApiKey(appId)
    let payload = {to: 'example@example.test', subject: 'A Greeting', body: 'Hello.'}
    let config = {api_key: apiKey}
    let input = new ActionInput({config, values: {payload}})
    let action = new SendEmailAction(input)
    action.fetch = fetchStub()

    before(() => setEnv('APP_ID', appId))
    before(async () => await action.perform())
    after(() => restoreEnv('APP_ID'))

    it('calls the app endpoint', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
        'https://2d07e0630036cf.trivialapps.io/webhooks/receive'
      );
    })

    it('performs a post', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({method: 'POST'}));
    })

    it('sets a JSON content type', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        headers: match({'content-type': 'application/json'})
      }))
    })

    it('sets the X-TRIVIAL-APP-ID header', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        headers: match({'x-trivial-app-id': appId})
      }))
    })

    it('sets the Authorization header', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        headers: match({'authorization': `Bearer ${apiKey}`})
      }))
    })

    it('sends the payload as the body', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        body: JSON.stringify(payload)
      }))
    })

    it('outputs the HTTP response', () => {
      expect(action.output.outputValues().payload).to.eql({
        status: 200, body: '{}', headers: {}
      })
    })
  })

})

const previousValues = {}

function setEnv(name, value) {
  previousValues.env = previousValues.env || {}
  previousValues.env = process.env[name]
  process.env[name] = value
}

function restoreEnv(name) {
  if (previousValues.env && previousValues.env.hasOwnProperty(name)) {
    process.env[name] = previousValues.env[name]
    delete previousValues.env[name]
  } else {
    delete process.env[name]
  }
}

function fetchStub(data = {}) {
  let response = {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: {},
    json: sinon.stub().resolves(data),
    text: sinon.stub().resolves(JSON.stringify(data))
  }
  return sinon.stub().resolves(response)
}

function testApiKey(appId = '1234', expiresIn = '1h') {
  return jwt.sign({app: appId}, null, {algorithm: 'none', expiresIn})
}
