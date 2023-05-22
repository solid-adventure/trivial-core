const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const GenericAction = require('../../../../../../lib/actionsv2/actions/Arka/Generic/Action')

describe('Arka/Generic', () => {

	let config = {
		arka: {
			api_key: 'testapikey'
		}
	}

	describe('.perform', () => {
		let payload = {
			baseURL: 'https://api-dev.arka.com/v1',
			path: '/orders',
			method: 'GET',
		}
		let input = new ActionInput({ config, values: { payload } })
		let action = new GenericAction(input)
		action.fetch = fetchStub()
		before(async () => await action.perform())

		it('calls the /orders endpoint', () => {
			expect(action.fetch).to.have.been.calledOnceWith(
				'https://api-dev.arka.com/v1/orders'
			)
		})
	})

	describe('.perform with search params', () => {
		let payload = {
			baseURL: 'https://api-dev.arka.com/v1',
			path: '/orders',
			method: 'GET',
			searchParams: {"limit": "2"}
		}
		let input = new ActionInput({ config, values: { payload } })
		let action = new GenericAction(input)
		action.fetch = fetchStub()
		before(async () => await action.perform())

		// let url = new URL(`${payload.baseURL}${payload.path}`)
		// for (let key of Object.keys(payload.searchParams)) {
    //   url.searchParams.set(key, payload.searchParams[key])
    // }

		it('applies the query params correctly', () => {
			expect(action.fetch).to.have.been.calledOnceWith(
				'https://api-dev.arka.com/v1/orders?limit=2'
				)
		})
	})

	describe('.perform with body', () => {
		let payload = {
			baseURL: 'https://api-dev.arka.com/v1',
			path: '/draft-orders',
			method: 'POST',
			body: {'weight':'200g'}
		}
		let input = new ActionInput({ config, values: { payload } })
		let action = new GenericAction(input)
		action.fetch = fetchStub()
		before(async () => await action.perform())

		it('applies the body params correctly', () => {
			expect(action.fetch).to.have.been.calledOnceWith(
				'https://api-dev.arka.com/v1/draft-orders'
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