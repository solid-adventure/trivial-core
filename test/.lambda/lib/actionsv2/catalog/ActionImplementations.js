const ActionCatalog = require('./ActionCatalog')
const fs = require('fs')
const path = require('path')

class ActionImplementations {
  static hasImplementation(name) {
    if (ActionCatalog.all.indexOf(name) === -1) {
      return false
    }

    return this._hasActionFile(name)
  }

  static _hasActionFile(name) {
    this._hasActions = this._hasActions || {}
    if (! (name in this._hasActions)) {
      const parts = String(name).split('/').filter(p => ! /^\./.test(p))
      this._hasActions[name] = fs.existsSync(
        path.join(__dirname, '..', 'actions', ...parts, 'Action.js')
      )
    }
    return this._hasActions[name]
  }

  static reset() {
    this._hasActions = {}
  }
}
module.exports = ActionImplementations
