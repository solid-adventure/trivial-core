const { expect } = require('chai')
const Redactions = require('../../lib/Redactions')

describe('Redactions', () => {

  describe('.addActionPaths', () => {
    before(() => delete Redactions._paths)
    after(() => delete Redactions._paths)

    it('adds unique paths to the list of actions', () => {
      Redactions.addActionPaths({redactPaths: ['my.custom.path']})
      expect(Redactions.paths).to.include('my.custom.path')
    })
  })

})
