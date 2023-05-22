const chai = require('chai')
const expect = chai.expect
const jwt = require('jsonwebtoken')
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../lib/actionsv2/ActionInput')
const OAuth2ActionBase = require('../../../../lib/actionsv2/base/OAuth2ActionBase')
const OAuth2ProtocolBase = require('../../../../lib/actionsv2/base/OAuth2ProtocolBase')

class CustomAction extends OAuth2ActionBase {
  get refreshEnabled() { return true }
  protocolHelper() { return CustomProtocolHelper }
}

class CustomProtocolHelper extends OAuth2ProtocolBase {
  static get authorizationUrl() { return 'https://example.test/auth' }
  static get tokenUrl() { return 'https://example.test/token' }
  static clientId(config) { return '12345' }
  static scope(config) { return 'example' }
}

describe('OAuth2ActionBase', () => {

  describe('.fetchWithAuth', () => {
    let payload = {}
    let config = {
      api_key: jwt.sign({}, null, {algorithm: 'none'}),
      code_grant: {token_type: 'bearer', access_token: 'access', refresh_token: 'refresh'}
    }
    origConfig = {api_key: {$ref: ['1','1']}, code_grant: {$ref: ['1','2']}}
    let input = new ActionInput({config, origConfig, values: {payload}})
    let action = new CustomAction(input)
    action.fetch = fetchStub({access_token: 'new access'})

    before(() => setEnv('APP_ID', 'myapp'))
    before(() => setEnv('LOG_TO_URL', 'https://trivial-api.test/webhooks'))
    after(() => restoreEnv('APP_ID'))
    after(() => restoreEnv('LOG_TO_URL'))

    before(async () => await action.fetchWithAuth('http://example.test/api'))

    it('tries to fetch the provided URL', () => {
      expect(action.fetch).to.have.been.calledWith(
        'http://example.test/api',
        {
          headers: {'authorization': 'Bearer access'}
        }
      )
    })

    it('refreshes the access token', () => {
      expect(action.fetch).to.have.been.calledWith(
        'https://example.test/token',
        {
          method: 'POST',
          headers: {'content-type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams('grant_type=refresh_token&refresh_token=refresh')
        }
      )
    })

    it('saves the updated token', () => {
      expect(action.fetch).to.have.been.calledWith(
        'https://trivial-api.test/apps/myapp/credentials',
        {
          method: 'PATCH',
          headers: {
            'content-type': 'application/json',
            'x-trivial-app-id': 'myapp',
            'authorization': `Bearer ${config.api_key}`
          },
          body: JSON.stringify({
            path: ['1','2','access_token'],
            credentials: {
              current_value: 'access',
              new_value: 'new access'
            }
          })
        }
      )
    })

    it('fetches the provided URL with the updated credentials', () => {
      expect(action.fetch).to.have.been.calledWith(
        'http://example.test/api',
        {
          headers: {'authorization': 'Bearer new access'}
        }
      )
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
    json: sinon.stub().resolves(data)
  }
  let reAuthResponse = {
    ok: false,
    status: 401,
    statusText: 'Not Authorized',
    headers: {},
    json: sinon.stub().resolves({})
  }
  let stub = sinon.stub()
  stub.onFirstCall().resolves(reAuthResponse)
  stub.resolves(response)
  return stub
}
