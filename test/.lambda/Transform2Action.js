
const { tryRequire, lastLoadErrorFor } = require('./utils')
const ActionBase = require('./lib/actionsv2/base/ActionBase')
const { TrivialSchemaLoader } = require('./lib/TrivialSchemas')
const { TypeAssigner } = require('./lib/TypeAssigner')
const $utils = require('./utility-functions')

class Transform2Action extends ActionBase {
  async perform() {
    const loader = new TrivialSchemaLoader()
    const destType = await loader.load("GenericObject")
    const out = new TypeAssigner(destType, destType.from("GenericObject", this.inputValue))
    const identifier = 5 
    out.assign("message", this._get_message_value(this.inputValue))
    this.logEvent('Transform', true, {input: {"GenericObject" : this.inputValue}, output: {"GenericObject": out.dest}}, identifier)
    this.setOutputValue(out.dest)
    return true
  }
}

Transform2Action.prototype._get_message_value = function(payload) {
  payload = Object.assign({}, this.values, payload)
  let additionalParams = Object.assign({}, this.values.additionalParams)
  const greet = $utils.greet
  with (payload) {
    return ( greet(hello) )
  }
}

module.exports = Transform2Action
