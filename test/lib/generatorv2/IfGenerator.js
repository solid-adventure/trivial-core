const { expect } = require('chai')
const IfGenerator = require('../../../lib/generatorv2/IfGenerator')
const GeneratorFactory = require('../../../lib/generatorv2/GeneratorFactory')

describe('IfGenerator', () => {
  let actionDef = {
    identifier: "2",
    type: "If",
    enabled: true,
    definition: {
      condition: "String(this.request.headers.authorization || '').trim().split(/Basic\s+/i)[1] === Buffer.from('user:password').toString('base64')",
      then: [{
        identifier: "3",
        type: "HttpRequest",
        enabled: true,
        config: {
          url: 'https://example.test'
        }
      }],
      else: [{
        identifier: "4",
        enabled: true,
        type: "Stop"
      }]
    }
  }
  let factory = new GeneratorFactory()
  let generator = new IfGenerator('ExampleAction', actionDef, factory)

  describe('_additionalRequires()', () => {
    it('requires the referenced actions', () => {
      expect(generator._additionalRequires()).to.match(
        /^const Stop = require\("\.\/lib\/actionsv2\/actions\/Stop\/Action"\)$/m
      )
      expect(generator._additionalRequires()).to.match(
        /^const HttpRequest = require\("\.\/lib\/actionsv2\/actions\/HttpRequest\/Action"\)$/m
      )
    })

    context('when custom functions are referenced', () => {
      let factory = new GeneratorFactory({definitions: [
        {type: 'function', name: 'ident', definition: 'function ident(x) { return x }'}
      ]})
      let actionCopy = JSON.parse(JSON.stringify(actionDef))
      actionCopy.definition.condition = 'ident(true) === ident(true)'
      let generator = new IfGenerator('ExampleAction', actionCopy, factory);

      it('includes the user-generated utility module', () => {
        expect(generator._additionalRequires()).to.match(
          /^const \$utils = require\('\.\/utility-functions'\)$/m
        )
      })
    })
  })

  describe('_performActions()', () => {
    it('conditionally performs the two sets of actions', () => {
      expect(generator._performActions()).to.eql(
        'if (this.checkCondition()) {\n      \n  await this.performHttpRequestAction()\n    } else {\n      \n  await this.performStopAction()\n    }'
      )
    })
  })

  describe('_actionMethods()', () => {
    it('outputs a method for performing each action', () => {
      expect(generator._actionMethods()).to.eql(
`
  async performHttpRequestAction(additionalParams) {
    const input = await this.nextInput({
      "url": "https://example.test"
    }, "payload", "payload", additionalParams, 'HttpRequestAction')
    const action = new HttpRequest(input)
    const output = await action.invoke()
    this.setLastOutput(output)
  }

  async performStopAction(additionalParams) {
    const input = await this.nextInput({}, "payload", "payload", additionalParams, 'StopAction')
    const action = new Stop(input)
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

    it('defines the condition check', () => {
      expect(generator.definition()).to.include(
        `ExampleAction.prototype.checkCondition = function() {\n` +
        `  const payload = Object.assign({}, this.values, this.inputValue)\n` +
        "  let additionalParams = Object.assign({}, this.values.additionalParams)\n" +
        `  with (payload) {\n` +
        "    \n" +
        `    return ( String(this.request.headers.authorization || '').trim().split(/Basic\s+/i)[1] === Buffer.from('user:password').toString('base64') )\n` +
        `  }\n` +
        `}`
      )
    })
  })
})
