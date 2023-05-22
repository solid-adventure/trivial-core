const mock = require('mock-fs')
const fs = require('fs')
const { expect } = require('chai')
const CodeGenerator = require('../../../lib/generatorv2/CodeGenerator')
const FileWriter = require('../../../lib/FileWriter')
const ActionImplementations = require('../../../lib/actionsv2/catalog/ActionImplementations')

describe("CodeGenerator", () => {

  const manifest = {
    program: {
      identifier: "1",
      definition: {
        actions: [{
          identifier: "2",
          name: "Auth Check",
          type: "If",
          enabled: true,
          definition: {
            condition: "String(this.request.headers.authorization || '').trim().split(/Basic\s+/i)[1] === Buffer.from('user:password').toString('base64')",
            then: [{
              identifier: "3",
              type: "Transform",
              enabled: true,
              definition: {
                from: "GenericObject",
                to: "GenericObject",
                transformations: [
                  {from: "'example@example.test'", to: "message.to"},
                  {from: "'Report'", to: "message.subject"},
                  {from: "`Report as of ${shout(report.date)}:\n\n${report.data.join('\n')}`", to: "message.body"}
                ]
              }
            },{
              identifier: "4",
              type: "HttpRequest",
              enabled: true,
              config: {
                url: 'https://example.test',
                method: 'POST'
              }
            }],
            else: [{
              identifier: "5",
              type: "Transform",
              enabled: true,
              definition: {
                from: "GenericObject",
                to: "HttpResponse",
                transformations: [
                  {from: "401", to: "status"},
                  {from: "{error: 'Not authorized'}", to: "body"}
                ]
              }
            },{
              identifier: "6",
              enabled: true,
              type: "SendResponse"
            },{
              identifier: "7",
              enabled: true,
              type: "Stop"
            }]
          },
        }]
      }
    },
    definitions: [{
      type: 'function',
      name: 'shout',
      enabled: true,
      definition: 'function shout(value) { return value.toUpperCase() }',
      notes: 'MAKE IT LOUDER'
    }]
  }

  let generator = new CodeGenerator(manifest)

  describe(".build()", () => {
    before(async () => {
      mock({
        'slugs/ExampleApp/lib/': { }
      })
      let writer = new FileWriter('slugs/ExampleApp')
      await generator.build(writer)
      await generator._buildContextManager(writer)
    })
    after(() => mock.restore())
    after(() => ActionImplementations.reset())

    it('generates a module to map old-style action calling to new style', () => {
      expect(fs.existsSync('slugs/ExampleApp/Application.js')).to.be.true
    })

    it('outputs conversion code to the conversion module', () => {
      expect(fs.readFileSync('slugs/ExampleApp/Application.js', {encoding: 'utf8'}))
        .to.include('const input = new ActionInput')
    })

    it('generates an Application module', () => {
      expect(fs.existsSync('slugs/ExampleApp/_Application.js')).to.be.true
    })

    it('outputs top-level code to the Application module', () => {
      expect(fs.readFileSync('slugs/ExampleApp/_Application.js', {encoding: 'utf8'}))
        .to.match(/tryRequire\(.\.\/AuthCheckAction.\)/)
    })

    it('generates a module for each encountered action', () => {
      expect(fs.existsSync('slugs/ExampleApp/AuthCheckAction.js')).to.be.true
      expect(fs.existsSync('slugs/ExampleApp/TransformAction.js')).to.be.true
      expect(fs.existsSync('slugs/ExampleApp/Transform2Action.js')).to.be.true
    })

    it('outputs action code in each action module', () => {
      expect(fs.readFileSync('slugs/ExampleApp/TransformAction.js', {encoding: 'utf8'}))
        .to.match(/Report as of/)
    })

    it('generates a utility-functions module', () => {
      expect(fs.existsSync('slugs/ExampleApp/utility-functions.js')).to.be.true
    })

    it('outputs custom block code to the utility-functions module', () => {
      expect(fs.readFileSync('slugs/ExampleApp/utility-functions.js', {encoding: 'utf8'}))
      .to.include(manifest.definitions[0].definition)
    })

    it('generates an initializer', () => {
      expect(fs.existsSync('slugs/ExampleApp/setup.js')).to.be.true
    })

    it('generates a context manager', () => {
      expect(fs.existsSync('slugs/ExampleApp/lib/ContextManager.js')).to.be.true
    })


    it('outputs setup code to the initializer module', () => {
      expect(fs.readFileSync('slugs/ExampleApp/setup.js', {encoding: 'utf8'}))
      .to.include('Redactions.addActionPaths(HttpRequest)')
    })
  })

})
