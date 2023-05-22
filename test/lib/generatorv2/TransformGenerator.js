const { expect } = require('chai')
const TransformGenerator = require('../../../lib/generatorv2/TransformGenerator')
const GeneratorFactory = require('../../../lib/generatorv2/GeneratorFactory')

describe('TransformGenerator', () => {

  let actionDef = {
    identifier: "2",
    type: "Transform",
    definition: {
      from: 'GenericObject',
      to: 'GenericObject',
      transformations: [
        {from: '"a value"', to: 'request.fieldA'},
        {from: '100', to: 'request.fieldB'},
      ]
    }
  }
  let factory = new GeneratorFactory()
  let generator = new TransformGenerator('TransformAction', actionDef, factory)

  describe('.requireExpression()', () => {
    it('returns a require statement for the same directory', () => {
      expect(generator.requireExpression()).to.eql(
        'const TransformAction = tryRequire("./TransformAction")'
      )
    })
  })

  describe('.invokeExpression()', () => {
    it('returns an expression that performs the action', () => {
      expect(generator.invokeExpression()).to.eql(
        "const action = new TransformAction(input)\n" +
        "const output = await action.invoke()"
      )
    })
  })

  describe('._setupTransformOutput()', () => {
    it('creates an instance of the requested type', () => {
      expect(generator._setupTransformOutput()).to.eql(
        '    const loader = new TrivialSchemaLoader()\n    const destType = await loader.load("GenericObject")\n    const out = new TypeAssigner(destType, destType.from("GenericObject", this.inputValue))\n    const identifier = 2 '
      )
    })
  })

  describe('._callTransformMethods()', () => {
    it('invokes all transform steps', () => {
      expect(generator._callTransformMethods()).to.eql(
        '    out.assign("request.fieldA", this._get_request_fieldA_value(this.inputValue))\n' +
        '    out.assign("request.fieldB", this._get_request_fieldB_value(this.inputValue))'
      )
    })
  })

  describe('._defineTransformMethods()', () => {
    it('defines all transform steps', () => {
      expect(generator._defineTransformMethods()).to.eql(
`TransformAction.prototype._get_request_fieldA_value = function(payload) {
  payload = Object.assign({}, this.values, payload)
  let additionalParams = Object.assign({}, this.values.additionalParams)
  with (payload) {
    return ( "a value" )
  }
}

TransformAction.prototype._get_request_fieldB_value = function(payload) {
  payload = Object.assign({}, this.values, payload)
  let additionalParams = Object.assign({}, this.values.additionalParams)
  with (payload) {
    return ( 100 )
  }
}`
      )
    })

    context('when the code references external functions', () => {
      let actionDef = {
        identifier: "2",
        type: "Transform",
        definition: {
          from: 'GenericObject',
          to: 'GenericObject',
          transformations: [
            {from: 'scream(some.value)', to: 'text'},
          ]
        }
      }
      let factory = new GeneratorFactory({definitions: [{
        type: 'function',
        name: 'scream',
        definition: "function scream(value) { return value.toUpperCase() }"
      }]})
      let generator = new TransformGenerator('ExampleAction', actionDef, factory)
      it('includes definitions for the references', () => {
        expect(generator._defineTransformMethods()).to.eql(
`ExampleAction.prototype._get_text_value = function(payload) {
  payload = Object.assign({}, this.values, payload)
  let additionalParams = Object.assign({}, this.values.additionalParams)
  const scream = $utils.scream
  with (payload) {
    return ( scream(some.value) )
  }
}`
        )
      })
    })
  })

  describe('._assignFromRValue()', () => {
    it('returns the value when one is present', () => {
      info = {assign: {from: '"the literal value"'}}
      expect(generator._assignFromRValue(info)).to.eql('"the literal value"')
    })

    it('returns "undefined" when the value is blank', () => {
      info = {assign: {from: ''}}
      expect(generator._assignFromRValue(info)).to.eql('undefined')
    })
  })

  describe('.definition()', () => {
    it('returns a string', () => {
      expect(generator.definition()).to.be.a('string')
    })

    it('declares a class with the provided name', () => {
      expect(generator.definition()).to.match(/class TransformAction extends ActionBase \{/)
    })

    it('imports the utilities module when custom blocks are present', () => {
      let factory = new GeneratorFactory({definitions: [{
        type: 'function',
        name: 'scream',
        definition: "function scream(value) { return value.toUpperCase() }"
      }]})
      let generator = new TransformGenerator('ExampleAction', actionDef, factory)
      expect(generator.definition()).to
        .include("const $utils = require('./utility-functions')")
    })
  })

})
