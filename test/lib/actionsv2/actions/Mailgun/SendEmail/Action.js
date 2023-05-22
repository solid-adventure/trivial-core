// const chai = require('chai')
// const expect = chai.expect
// const sinon = require('sinon')
// const match = sinon.match
// chai.use(require('sinon-chai'))

// const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
// const SendEmailAction = require('../../../../../../lib/actionsv2/actions/Mailgun/SendEmail/Action')


// describe('Mailgun/SendEmail', () => {

//   describe('.perform', () => {
//     let payload = {
//       to: 'juan.carbajal@withtrivial.com',
//       from: 'noreply@withtrivial.com',
//       subject: 'test email',
//       text: 'test text'
//     }
//     let url_encoded_params = 'to=juan.carbajal%40withtrivial.com&' +
//       'from=noreply%40withtrivial.com&' +
//       'subject=test+email&' +
//       'text=test+text'

//     let config = { mailgun: {
//       api_key : 'testapikey',
//       domain : 'withtrivial.com'
//     }}

//     let input = new ActionInput({config, values: {payload}})
//     let action = new SendEmailAction(input)
//     action.fetch = fetchStub()

//     before (async () => await action.perform())

//     it ('calls the messages endpoint', () => {
//       expect(action.fetch).to.have.been.calledOnceWith(
//         `https://api.mailgun.net/v3/${encodeURIComponent(config.mailgun.domain)}/messages`
//       )
//     })

//     it('performs a post', () => {
//       expect(action.fetch).to.have.been.calledOnceWith(match.string, match({method: 'POST'}));
//     })

//     it('authorizes with the api key', () => {
//       expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
//         headers: match({'authorization': `Basic ${Buffer.from('api:' + config.mailgun.api_key).toString('base64')}`})
//       }))
//     })

//     it('sends the input value as the body', () => {
//       expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
//         body: url_encoded_params
//       }))
//     })

//     it('outputs the HTTP response', () => {
//       expect(action.output.outputValues().payload).to.eql({
//         status: 200, body: {}, headers: {}
//       })
//     })
//   })
// })

// function fetchStub(data = {}) {
//     let response = {
//       ok: true,
//       status: 200,
//       statusText: 'OK',
//       headers: {},
//       json: sinon.stub().resolves(data)
//     }
//     return sinon.stub().resolves(response)
// }
