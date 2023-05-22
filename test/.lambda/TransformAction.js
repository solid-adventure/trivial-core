
const { tryRequire, lastLoadErrorFor } = require('./utils')
const ActionBase = require('./lib/actionsv2/base/ActionBase')
const { TrivialSchemaLoader } = require('./lib/TrivialSchemas')
const { TypeAssigner } = require('./lib/TypeAssigner')
const $utils = require('./utility-functions')

class TransformAction extends ActionBase {
  async perform() {
    const loader = new TrivialSchemaLoader()
    const destType = await loader.load("GenericObject")
    const out = new TypeAssigner(destType, destType.from("GenericObject", this.inputValue))
    const identifier = 3 
    out.assign("body.challenge", this._get_body_challenge_value(this.inputValue))
    this.logEvent('Transform', true, {input: {"GenericObject" : this.inputValue}, output: {"GenericObject": out.dest}}, identifier)
    this.setOutputValue(out.dest)
    return true
  }
}

TransformAction.prototype._get_body_challenge_value = function(payload) {
  payload = Object.assign({}, this.values, payload)
  let additionalParams = Object.assign({}, this.values.additionalParams)
  with (payload) {
    return ( challenge )
  }
}

module.exports = TransformAction
