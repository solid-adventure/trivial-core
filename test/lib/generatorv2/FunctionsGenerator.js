const { expect } = require('chai')
const FunctionsGenerator = require('../../../lib/generatorv2/FunctionsGenerator')

describe('FunctionsGenerator', () => {

  const self = {
      name: "self",
      definition: "function self (value) {\n\n  return value\n\n}",
      notes: "Returns the provided value"
  }
  const add = {
      name: "add",
      definition: "function add (value1, value1) {\n\n  return value1 + value2\n\n}",
      notes: ""
  }
  const generator = new FunctionsGenerator([self, add])

  describe('.definition()', () => {
    const code = generator.definition()

    it('returns a string', () => {
      expect(code).to.be.a('string')
    })

    it('outputs all function definitions', () => {
      expect(code).to.include(self.definition)
      expect(code).to.include(add.definition)
    })

    it('includes notes in doc comments', () => {
      expect(code).to.include(
        "/**\n" +
        " * Returns the provided value\n" +
        " */\n" +
        "function self (value) {"
      )
    })

    it('exports all function definitions', () => {
      expect(code).to.include(
        "module.exports = {\n" +
        "  self,\n" +
        "  add\n" +
        "}"
      )
    })
  })

})
