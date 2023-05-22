
const { tryRequire, lastLoadErrorFor } = require('./utils')
const ActionBase = require('./lib/actionsv2/base/ActionBase')
const ActionInput = require('./lib/actionsv2/ActionInput')
const CredentialManager = require('./lib/CredentialManager')
const _Application = tryRequire('./_Application')

class Application extends ActionBase {
  async perform(fetch) {
    this.logger.info(">>>>> START")
    if (_Application) {
      const config = {}
      const input = new ActionInput({
        logger: this.logger,
        diagnostics: this.diagnostics,
        request: this.request,
        response: this.response,
        origConfig: config,
        config: await CredentialManager.resolveCredentials(config),
        inputName: "payload",
        outputName: "payload",
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
