
const { tryRequire, lastLoadErrorFor } = require('./utils')
const ActionBase = require('./lib/actionsv2/base/ActionBase')
const TransformAction = tryRequire("./TransformAction")
const SendResponse = require("./lib/actionsv2/actions/SendResponse/Action")
const Transform2Action = tryRequire("./Transform2Action")
const HttpRequest = require("./lib/actionsv2/actions/HttpRequest/Action")
const $utils = require('./utility-functions')

class IsChallengeAction extends ActionBase {
  async perform() {
    if (this.checkCondition()) {
      
  await this.performTransformAction()
  
      if (this.canProceed()) {
        await this.performSendResponseAction()
      }
    } else {
      
  await this.performTransform2Action()
  
      if (this.canProceed()) {
        await this.performHttpRequestAction()
      }
    }
    return this.canProceed()
  }

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

  async performSendResponseAction(additionalParams) {
    const input = await this.nextInput({}, "payload", "payload", additionalParams, 'SendResponseAction')
    const action = new SendResponse(input)
    const output = await action.invoke()
    this.setLastOutput(output)
  }

  async performTransform2Action(additionalParams) {
    if (Transform2Action) {
      const input = await this.nextInput({}, "payload", "payload", additionalParams, 'Transform2Action')
      const action = new Transform2Action(input)
      const output = await action.invoke()
      this.setLastOutput(output)
    } else {
      throw lastLoadErrorFor("./Transform2Action")
    }
  }

  async performHttpRequestAction(additionalParams) {
    const input = await this.nextInput({
      "url": "http://localhost:52987/actions",
      "method": "POST"
    }, "payload", "payload", additionalParams, 'HttpRequestAction')
    const action = new HttpRequest(input)
    const output = await action.invoke()
    this.setLastOutput(output)
  }
}

IsChallengeAction.prototype.checkCondition = function() {
  debugger
  const payload = Object.assign({}, this.values, this.inputValue)
  let additionalParams = Object.assign({}, this.values.additionalParams)
  with (payload) {
    
    return ( payload.challenge )
  }
}

module.exports = IsChallengeAction
