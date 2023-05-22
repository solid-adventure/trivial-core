const { expect } = require('chai')
const ActionGenerator = require('../../../lib/generatorv2/ActionGenerator')
const GeneratorFactory = require('../../../lib/generatorv2/GeneratorFactory')

describe('ActionGenerator', () => {

  let actionDef = {
    identifier: "1",
    definition: {
      actions: [{
        identifier: "2",
        type: "Transform",
        definition: {
          from: 'GenericObject',
          to: 'GenericObject',
          transformations: [
            {from: '"a value"', to: 'request.fieldA'},
            {from: '100', to: 'request.fieldB'},
          ]
        },
        enabled: true
      },
      {
        identifier: "3",
        type: "HttpRequest",
        config: {
          url: 'https://example.test'
        },
        enabled: true
      }]
    }
  }
  let factory = new GeneratorFactory()
  let generator = new ActionGenerator('ExampleAction', actionDef, factory)

  describe('requireExpression()', () => {
    it('returns a require statement for the same directory', () => {
      expect(generator.requireExpression()).to.eql(
        'const ExampleAction = tryRequire("./ExampleAction")'
      )
    })
  })

  describe('invokeExpression()', () => {
    it('returns an expression that performs the action', () => {
      expect(generator.invokeExpression()).to.eql(
        "const action = new ExampleAction(input)\n" +
        "const output = await action.invoke()"
      )
    })
  })

  describe('_additionalRequires()', () => {
    it('requires the referenced actions', () => {
      expect(generator._additionalRequires()).to.match(
        /^const TransformAction = tryRequire\("\.\/TransformAction"\)$/m
      )
      expect(generator._additionalRequires()).to.match(
        /^const HttpRequest = require\("\.\/lib\/actionsv2\/actions\/HttpRequest\/Action"\)$/m
      )
    })

    context('with multiple actions of the same type', () => {
      let actionDef = {
        definition: {
          actions: [
            {identifier: '2', type: 'HttpRequest', enabled: true},
            {identifier: '3', type: 'HttpRequest', enabled: true}
          ]
        }
      }
      let factory = new GeneratorFactory()
      let generator = new ActionGenerator('ExampleAction', actionDef, factory)

      it('requires the module only once', () => {
        expect(generator._additionalRequires()).to.eql(
          'const HttpRequest = require("./lib/actionsv2/actions/HttpRequest/Action")'
        )
      })
    })
  })

  describe('_performActions()', () => {
    it('performs each action', () => {
      expect(generator._performActions()).to.eql(
        '\nawait this.performTransformAction()\n\n    if (this.canProceed()) {\n      await this.performHttpRequestAction()\n    }'
      )
    })
  })

  describe('_actionMethods()', () => {
    it('outputs a method for performing each action', () => {
      expect(generator._actionMethods()).to.eql(
`
  async performTransformAction(additionalParams) {
    if (TransformAction) {
      const input = await this.nextInput({}, "payload", "payload", additionalParams, 'TransformAction')
      const action = new TransformAction(input)
      const output = await action.invoke()
      this.setLastOutput(output)
    } else {
      throw lastLoadErrorFor("./TransformAction")
    }
  }

  async performHttpRequestAction(additionalParams) {
    const input = await this.nextInput({
      "url": "https://example.test"
    }, "payload", "payload", additionalParams, 'HttpRequestAction')
    const action = new HttpRequest(input)
    const output = await action.invoke()
    this.setLastOutput(output)
  }`
      )
    })
  })

  describe('.definition()', () => {
    it('returns a string', () => {
      expect(generator.definition()).to.be.a('string')
    })

    it('declares a class with the provided name', () => {
      expect(generator.definition()).to.match(/class ExampleAction extends ActionBase \{/)
    })

    it('exports the class', () => {
      expect(generator.definition()).to.match(/module\.exports = ExampleAction/)
    })
  })

})
