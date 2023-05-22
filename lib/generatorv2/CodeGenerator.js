const GeneratorFactory = require('./GeneratorFactory')
const ActionGenerator = require('./ActionGenerator')
const FunctionsGenerator = require('./FunctionsGenerator')
const InitializerGenerator = require('./InitializerGenerator')

class CodeGenerator {
  constructor(manifest, featureSettings) {
    this.manifest = manifest
    this.featureSettings = featureSettings
    this.factory = new GeneratorFactory(manifest)
  }

  async build(writer) {
    console.log(`[CodeGenerator][Build]`)
    await Promise.all([
      this._buildConversionModule(writer),
      this._buildApplication(writer),
      this._buildDefinedActions(writer),
      this._buildFunctionDefinitions(writer),
      this._buildInitializer(writer)
    ])
    .then(n => this._buildContextManager(writer))
  }

  async _buildApplication(writer) {
    const gen = new ActionGenerator('_Application', this.manifest.program, this.factory)
    await writer.write('_Application.js', gen.definition())
  }

  async _buildDefinedActions(writer) {
    let gen;
    while (gen = this.factory.nextUndefined()) {
      await writer.write(`${gen.name}.js`, gen.definition())
    }
  }

  async _buildFunctionDefinitions(writer) {
    const defs = this.factory.functionDefinitions
    if (defs.length > 0) {
      const gen = new FunctionsGenerator(defs)
      await writer.write('utility-functions.js', gen.definition())
    }
  }

  async _buildContextManager(writer) {
    await writer.write('lib/ContextManager.js', this.factory.contextManager.definition())
  }

  async _buildInitializer(writer) {
    const gen = new InitializerGenerator(this.factory.initializedGenerators, this.featureSettings)
    await writer.write('setup.js', gen.definition())
  }

  async _buildConversionModule(writer) {
    // temporary solution to map old style action calling to new
    await writer.write('Application.js',
`
const { tryRequire, lastLoadErrorFor } = require('./utils')
const ActionBase = require('./lib/actionsv2/base/ActionBase')
const ActionInput = require('./lib/actionsv2/ActionInput')
const CredentialManager = require('./lib/CredentialManager')
const _Application = tryRequire('./_Application')

class Application extends ActionBase {
  async perform(fetch) {
    this.logger.info(">>>>> START")
    if (_Application) {
      const config = ${JSON.stringify(this.manifest.program.config || {}, null, 2).split('\n').join('\n      ')}
      const input = new ActionInput({
        logger: this.logger,
        diagnostics: this.diagnostics,
        request: this.request,
        response: this.response,
        origConfig: config,
        config: await CredentialManager.resolveCredentials(config),
        inputName: ${JSON.stringify(this.manifest.program.inputName || 'payload')},
        outputName: ${JSON.stringify(this.manifest.program.outputName || 'payload')},
        values: {payload: this.payload, event: this.payload, initialPayload: this.payload, additionalParams: null}
      })
      const _app = new _Application(input)
      const output = await _app.invoke()
      this.logger.info(">>>>> FINISH")
      return {topic: null, status: 200}
    }  else {
      throw lastLoadErrorFor('./_Application')
    }
  }
}

module.exports = Application
`
    )
  }
}

module.exports = CodeGenerator
