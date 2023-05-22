const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const GenericAction = require('../../../../../../lib/actionsv2/actions/Square/Generic/Action')

describe('Square/Generic', () => {


  let config = {
    Square: {
      application_id: 'testid',
      application_scope: 'EMPLOYEES_READ+EMPLOYEES_WRITE',
      application_secret: 'testsecret',
      code_grant: { token_type: 'Bearer', access_token: '4f5da6gsd6' }
    }
  }
  describe('.perform', () => {
    let payload = {
      baseURL: 'https://connect.squareup.com/v2',
      path: '/team-members/testid',
      method: 'GET'
    }
    let input = new ActionInput({ config, values: { payload } })
    let action = new GenericAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('calls the /team-members/{team_member_id} endpoint', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
        'https://connect.squareup.com/v2/team-members/testid'
      )
    })

    it('authorizes with the access token', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        headers: match({ 'authorization': `${config.Square.code_grant.token_type} ${config.Square.code_grant.access_token}` })
      }))
    })
  })

  describe('.perform with search params', () => {
    let payload = {
      baseURL: 'https://connect.squareup.com/v2',
      path: '/catalog/list',
      method: 'GET',
      searchParams: { "limit": 1 },
    }
    let url = new URL(`${payload.baseURL}${payload.path}`)
    for (let key of Object.keys(payload.searchParams)) {
        url.searchParams.set(key, payload.searchParams[key])
    }
    let input = new ActionInput({ config, values: { payload } })
    let action = new GenericAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('applies the query params correctly', () => {
        expect(action.fetch).to.have.been.calledOnceWith(url.href)
    })

    it('authorizes with the access token', () => {
        expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
            headers: match({ 'authorization': `${config.Square.code_grant.token_type} ${config.Square.code_grant.access_token}` })
        }))
    })
  })

  describe('.perform with body', () => {
    let payload = {
      baseURL: 'https://connect.squareup.com/v2',
      path: '/labor/shifts',
      method: 'POST',
      body: {
        "idempotency_key": "HIDSNG5KS478L",
        "shift": {
          "team_member_id": "ormj0jJJZ5OZIzxrZYJI",
          "location_id": "PAA1RJZZKXBFG",
          "start_at": "2019-01-25T03:11:00-05:00",
          "end_at": "2019-01-25T13:11:00-05:00",
          "wage": {
            "title": "Barista",
            "hourly_rate": {
              "amount": 1100,
              "currency": "USD"
            }
          }
        }
      }
    }


    let input = new ActionInput({ config, values: { payload } })
    let action = new GenericAction(input)
    action.fetch = fetchStub()
    before(async () => await action.perform())

    it('sends the body', () => {
        expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
            body: JSON.stringify(payload.body)
        }))
    })

    it('authorizes with the access token', () => {
        expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
            headers: match({ 'authorization': `${config.Square.code_grant.token_type} ${config.Square.code_grant.access_token}` })
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
