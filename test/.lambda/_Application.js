
const { tryRequire, lastLoadErrorFor } = require('./utils')
const ActionBase = require('./lib/actionsv2/base/ActionBase')
const IsChallengeAction = tryRequire("./IsChallengeAction")

class _Application extends ActionBase {
  async perform() {
    
await this.performIsChallengeAction()
    return this.canProceed()
  }

  async performIsChallengeAction(additionalParams) {
    if (IsChallengeAction) {
      const input = await this.nextInput({}, "payload", "payload", additionalParams, 'IsChallengeAction')
      const action = new IsChallengeAction(input)
      const output = await action.invoke()
      this.setLastOutput(output)
    } else {
      throw lastLoadErrorFor("./IsChallengeAction")
    }
  }
}



module.exports = _Application
