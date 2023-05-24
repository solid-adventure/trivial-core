
const ActionIterator = require('../lib/actionsv2/catalog/ActionIterator')

class ActionEnabler {

  constructor(def) {
    this.def = def || {}
    this.iterator = new ActionIterator(this.def)
  }

  disable() {
    this.iterator.visitAll(def => { def.enabled = false })
    return this.def
  }

  enable() {
    this.iterator.visitAll(def => { def.enabled = true })
    return this.def
  }

}

module.exports = ActionEnabler
