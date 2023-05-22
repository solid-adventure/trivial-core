const { expect } = require('chai')
const { TypeAssigner, TypeIdentifier } = require('../../lib/TypeAssigner')
const { schema } = require('../../lib/schema-utils')

describe('TypeAssigner', () => {

  let type = schema({fields: {number: {type: Number}}})

  describe('assign()', () => {

    it('assigns to a known field with the correct type', () => {
      const dest = {}
      new TypeAssigner(type, dest).assign('number', '10')
      expect(dest.number).to.eq(10)
    })

    it('assigns to an unknown field with the provided type', () => {
      const dest = {}
      new TypeAssigner(type, dest).assign('foo', 'bar')
      expect(dest.foo).to.eq('bar')
    })

    it('follows paths into existing objects', () => {
      const dest = {foo: {bar: 1}}
      new TypeAssigner(type, dest).assign('foo.baz', 2)
      expect(dest).to.eql({foo: {bar: 1, baz: 2}})
    })

    it('creates a new object when required', () => {
      const dest = {}
      new TypeAssigner(type, dest).assign('foo.bar', 'baz')
      expect(dest).to.eql({foo: {bar: 'baz'}})
    })

    it('supports nesting of custom types', () => {
      let outerType = schema({fields: {count: {type: type}}})
      let payload = {example: true}
      let out = new TypeAssigner(outerType, outerType.from('GenericObject', payload))
      out.assign('count.number', 199)
      expect(out.dest).to.eql({count: {number: 199}})
    })
  })
})

describe('TypeIdentifier', () => {

  let fractionType = schema({fields: {numerator: {type: Number}, denominator: {type: Number}}})
  let type = schema({fields: {number: {type: Number}, fraction: {type: fractionType}}})
  let identifier = new TypeIdentifier(type)

  describe('specAt()', () => {
    it('returns the spec for the named field', () => {
      expect(identifier.specAt('fraction')).to.eq(type.fields.fraction)
    })

    it('returns undefined when no such field is defined', () => {
      expect(identifier.specAt('letter')).to.be.undefined
    })

    it('recurses into inner types', () => {
      expect(identifier.specAt('fraction.numerator')).to.eq(fractionType.fields.numerator)
    })
  })

  describe('typeAt()', () => {
    it('returns the type for the named field', () => {
      expect(identifier.typeAt('fraction')).to.eq(fractionType)
    })

    it('returns undefined when no such field is defined', () => {
      expect(identifier.typeAt('letter')).to.be.undefined
    })
  })
})
