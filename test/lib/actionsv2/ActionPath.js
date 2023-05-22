const { expect } = require('chai')
const ActionPath = require('../../../lib/actionsv2/ActionPath')

describe('ActionPath', () => {

  let actionPath = null

  describe('constructor()', () => {

    context('with an action value like "action/<action name>/<id>"', () => {
      let path = 'action/Stop/3'
      before(() => actionPath = new ActionPath(path))

      it('sets type to "action"', () => {
        expect(actionPath.type).to.eql('action')
      })

      it('sets name to <action name>', () => {
        expect(actionPath.name).to.eql('Stop')
      })

      it('sets id to <id>', () => {
        expect(actionPath.id).to.eql('3')
      })

      it('sets protocolName to <action name>', () => {
        expect(actionPath.protocolName).to.eql('Stop')
      })
    })

    context('with an action value like "action/<action folder>/<action name>/<id>"', () => {
      let path = 'action/Discord/PostMessage/d'
      before(() => actionPath = new ActionPath(path))

      it('sets type to "action"', () => {
        expect(actionPath.type).to.eql('action')
      })

      it('sets name to <action folder>/<action name>', () => {
        expect(actionPath.name).to.eql('Discord/PostMessage')
      })

      it('sets id to <id>', () => {
        expect(actionPath.id).to.eql('d')
      })

      it('sets protocolName to <action folder>/<action name>', () => {
        expect(actionPath.protocolName).to.eql('Discord/PostMessage')
      })

      it('allows ids to begin with numbers', () => {
        let actionPath = new ActionPath('action/Discord/PostMessage/4')
        expect(actionPath.id).to.eql('4')
      })
    })

    context('with an action value like "action/<action name>/<id>/credentials/<credential type>/<set id>"', () => {
      let path = 'action/Discord/PostMessage/d/credentials/Discord/c594df5f-9ddd-4314-8216-c9e77f7d2fae'
      before(() => actionPath = new ActionPath(path))

      it('sets type to "action"', () => {
        expect(actionPath.type).to.eql('action')
      })

      it('sets name to <action folder>/<action name>', () => {
        expect(actionPath.name).to.eql('Discord/PostMessage')
      })

      it('sets id to <id>', () => {
        expect(actionPath.id).to.eql('d')
      })

      it('sets innerType to "credentials"', () => {
        expect(actionPath.innerType).to.eql('credentials')
      })

      it('sets innerName to <credential type>', () => {
        expect(actionPath.innerName).to.eql('Discord')
      })

      it('sets innerId to <set id>', () => {
        expect(actionPath.innerId).to.eql('c594df5f-9ddd-4314-8216-c9e77f7d2fae')
      })

      it('sets protocolName to <credential type>', () => {
        expect(actionPath.protocolName).to.eql('Discord')
      })

      it('allows ids to begin with numbers', () => {
        let actionPath = new ActionPath(
          'action/Discord/PostMessage/4/credentials/Discord/c594df5f-9ddd-4314-8216-c9e77f7d2fae'
        )
        expect(actionPath.id).to.eql('4')
      })
    })

    context('with an action value like "vault/<credential type>/<id>"', () => {
      let path = 'vault/Discord/c594df5f-9ddd-4314-8216-c9e77f7d2fae'
      before(() => actionPath = new ActionPath(path))

      it('sets type to "vault"', () => {
        expect(actionPath.type).to.eql('vault')
      })

      it('sets name to <credential type>', () => {
        expect(actionPath.name).to.eql('Discord')
      })

      it('sets id to <id>', () => {
        expect(actionPath.id).to.eql('c594df5f-9ddd-4314-8216-c9e77f7d2fae')
      })

      it('sets protocolName to <credential type>', () => {
        expect(actionPath.protocolName).to.eql('Discord')
      })
    })

    context('with any other action value', () => {
      let path = 'action/ Invalid'

      it('throws an exception', () => {
        expect(() => new ActionPath(path)).to.throw('Invalid action path')
      })
    })

  })

  describe('.path', () => {
    it('re-constructs an "action/<action name>/<id>" style path correctly', () => {
      let path = 'action/Discord/PostMessage/d'
      expect(new ActionPath(path).path).to.equal(path)
    })

    it('re-constructs an "action/<action name>/<id>/credentials/<credential type>/<set id>" style path correctly', () => {
      let path = 'action/Discord/PostMessage/d/credentials/Discord/c594df5f-9ddd-4314-8216-c9e77f7d2fae'
      expect(new ActionPath(path).path).to.equal(path)
    })

    it('re-constructs a "vault/<credential type>/<id>" style path correctly', () => {
      let path = 'vault/Discord/c594df5f-9ddd-4314-8216-c9e77f7d2fae'
      expect(new ActionPath(path).path).to.equal(path)
    })
  })

})
