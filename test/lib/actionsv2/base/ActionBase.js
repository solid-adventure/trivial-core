const chai = require('chai')
const expect = chai.expect
const jwt = require('jsonwebtoken')
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../lib/actionsv2/ActionInput')
const ActionBase = require('../../../../lib/actionsv2/base/ActionBase')
const OAuth2ActionBase = require('../../../../lib/actionsv2/base/OAuth2ActionBase')

class LocalAction extends ActionBase {
}

class SharedAction extends OAuth2ActionBase {
  get credentialName() { return 'example' }
}

describe('ActionBase', () => {

  describe('logEvent', () => {
    let payload = {}
    let input = new ActionInput({values: {payload}})
    let action = new LocalAction(input)

    it('logs a key/value pair', () => {
      expect(action.diagnostics.events[0]).to.eql(undefined)
      action.logEvent('Test event', true, {name: "whatever"})
      expect(action.diagnostics.events[0].detail).to.eql({name: "whatever"})
    })

    it('logs an array of arrays', () => {
      action.diagnostics.events = []
      expect(action.diagnostics.events[0]).to.eql(undefined)
      action.logEvent('Test event', true, {arrayOfArrays: [[1,2,3]]})
      expect(action.diagnostics.events[0].detail).to.eql({arrayOfArrays: [[1,2,3]]})
    })

    it('redacts a password on a body', () => {
      action.diagnostics.events = []
      action.logEvent('Test event', true, {body: {password: "1234"}})
      expect(action.diagnostics.events[0].detail).to.eql({body: {password: "[REDACTED]"}})
    })

    it('redacts an Authorization from a header', () => {
      action.diagnostics.events = []
      action.logEvent('Test event', true, {headers: {Authorization: "XYZ123"}})
      expect(action.diagnostics.events[0].detail).to.eql({headers: {Authorization: "[REDACTED]"}})
    })
  })

  context('.additionalParamsForInput()', () => {
    context('with no ContextManager entries', () => {
        let payload = {additionalParams: {offset: 'x'}}
        let input = new ActionInput({values: {payload}})
        let action = new LocalAction(input)
        let result = action.additionalParamsForInput('LocalAction', {}, payload.additionalParams)

        it('passes through existing additionalParams', () => {
          expect(result).to.eql({ additionalParams: {offset: 'x'} })
        })

    })
  })

  describe('.internalAuthKey()', () => {
    context('with an expired API key', () => {
      context('called on an action using local credentials', () => {
        let result = null
        let payload = {}
        let anHourAgo = Math.floor(Date.now() / 1000) - 3600;
        let config = {
          api_key: jwt.sign({exp: anHourAgo}, null, {algorithm: 'none'})
        }
        origConfig = {api_key: {$ref: ['1','1']}}
        let input = new ActionInput({config, origConfig, values: {payload}})
        let action = new LocalAction(input)
        action.fetch = fetchStub({api_key: 'new key'})

        before(() => setEnv('APP_ID', 'myapp'))
        before(() => setEnv('LOG_TO_URL', 'https://trivial-api.test/webhooks'))
        after(() => restoreEnv('APP_ID'))
        after(() => restoreEnv('LOG_TO_URL'))

        before(async () => result = await action.internalAuthKey())

        it('refreshes the expired token', () => {
          expect(action.fetch).to.have.been.calledWith(
            'https://trivial-api.test/apps/myapp/api_key',
            {
              method: 'PUT',
              headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${config.api_key}`
              },
              body: JSON.stringify({
                path: "1.1"
              })
            }
          )
        })

        it('returns the new key', () => {
          expect(result).to.eql('new key')
        })
      })

      context('called on an action using shared credentials', () => {
        let result = null
        let payload = {}
        let anHourAgo = Math.floor(Date.now() / 1000) - 3600;
        let config = {
          example: {
            api_key: jwt.sign({exp: anHourAgo}, null, {algorithm: 'none'})
          }
        }
        origConfig = {example: {$cred: 'example-uuid'}}
        let input = new ActionInput({config, origConfig, values: {payload}})
        let action = new SharedAction(input)
        action.fetch = fetchStub({api_key: 'new key'})

        before(() => setEnv('APP_ID', 'myapp'))
        before(() => setEnv('LOG_TO_URL', 'https://trivial-api.test/webhooks'))
        after(() => restoreEnv('APP_ID'))
        after(() => restoreEnv('LOG_TO_URL'))

        before(async () => result = await action.internalAuthKey())

        it('refreshes the expired token', () => {
          expect(action.fetch).to.have.been.calledWith(
            'https://trivial-api.test/credential_sets/example-uuid/api_key',
            {
              method: 'PUT',
              headers: {
                'content-type': 'application/json',
                'authorization': `Bearer ${config.example.api_key}`
              },
              body: JSON.stringify({
                path: "api_key"
              })
            }
          )
        })

        it('returns the new key', () => {
          expect(result).to.eql('new key')
        })
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
    json: sinon.stub().resolves(data)
  }
  let stub = sinon.stub()
  stub.resolves(response)
  return stub
}
