const { expect } = require('chai')
const ActionImplementations = require('../../../../lib/actionsv2/catalog/ActionImplementations')

describe('ActionImplementations', () => {

  describe('.hasImplementation', () => {
    it('returns false for a non-existent action', () => {
      expect(ActionImplementations.hasImplementation('Nonesuch')).to.be.false
    })

    it('returns false for an action that does not have an Action.js', () => {
      expect(ActionImplementations.hasImplementation('Group')).to.be.false
    })

    it('returns true for an action that has an Action.js', () => {
      expect(ActionImplementations.hasImplementation('HttpRequest')).to.be.true
    })
  })

})
