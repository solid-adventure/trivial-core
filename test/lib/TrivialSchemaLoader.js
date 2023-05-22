const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
chai.use(require('sinon-chai'))
const { TrivialSchemaLoader } = require('../../lib/TrivialSchemas')

describe("TrivialSchemaLoader", () => {

  describe('loads HTTPResponse schema', async() => {
    const loader = new TrivialSchemaLoader()
    const destType = await loader.load("HTTPResponse")

    it('defines from function for transorm', () => {
      expect(typeof(destType.from)).to.eql("function")
    })

    it('defines field on schema', () => {
      expect(typeof(destType.from)).to.eql("function")
    })


  })

})