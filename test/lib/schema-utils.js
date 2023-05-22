const { expect } = require('chai')
const { schema } = require('../../lib/schema-utils')

describe('schema-utils', () => {

  describe('schema()', () => {
    let customType = schema({fields: {}})

    it('returns a function', () => {
      expect(typeof customType).to.eql('function')
    })

    describe('returned function', () => {
      it('returns an empty object if called without arguments', () => {
        expect(customType()).to.eql({})
      })
    })
  })

})
