const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput')
const PostMessageAction = require('../../../../../../lib/actionsv2/actions/Discord/PostMessage/Action')

describe('Discord/PostMessageAction', () => {

  describe('.perform', () => {
    let payload = {message: {content: 'test'}}
    let config = {discord: {
      client_id: '065d4ec1f44ead9e',
      client_secret: 'e328d22179475e54',
      bot_token: '844b50ca0a6874ff',
      code_grant: {token_type: 'bearer', guild: {system_channel_id: '12345'}}
    } }
    let input = new ActionInput({config, values: {payload}})
    let action = new PostMessageAction(input)
    action.fetch = fetchStub()

    before(async () => await action.perform())

    it('calls the messages endpoint', () => {
      expect(action.fetch).to.have.been.calledOnceWith(
        'https://discord.com/api/v9/channels/12345/messages'
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

    it('authorizes with the bot key', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        headers: match({'authorization': `Bot ${config.discord.bot_token}`})
      }))
    })

    it('sends the message object as the body', () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
        body: JSON.stringify(payload.message)
      }))
    })

    it('outputs the HTTP response', () => {
      expect(action.output.outputValues().payload).to.eql({
        status: 200, body: {}, headers: {}
      })
    })

    context('when a channel id is given', () => {
      let payload = {channel_id: '67890', message: {content: 'test'}}
      let input = new ActionInput({config, values: {payload}})
      let action = new PostMessageAction(input)
      action.fetch = fetchStub()

      before(async () => await action.perform())

      it('posts to that channel', () => {
        expect(action.fetch).to.have.been.calledOnceWith(
          'https://discord.com/api/v9/channels/67890/messages'
        );
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
