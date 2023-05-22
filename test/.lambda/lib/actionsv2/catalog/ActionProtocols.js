const ActionCatalog = require('./ActionCatalog')
const fs = require('fs')
const path = require('path')

class ActionProtocols {
  static hasProtocol(name) {
    if (ActionCatalog.all.find(action => action === name || action.substring(0, name.length + 1) === `${name}/`) === undefined) {
      return false
    }

    return this._hasProtocolFile(name)
  }

  static forType(name) {
    if (this.hasProtocol(name)) {
      return require(`../actions/${name}/Protocol`)
    }
  }

  static _hasProtocolFile(name) {
    this._hasProtocols = this._hasProtocols || {}
    if (! (name in this._hasProtocols)) {
      const parts = String(name).split('/').filter(p => ! /^\./.test(p))
      this._hasProtocols[name] = fs.existsSync(
        path.join(__dirname, '..', 'actions', ...parts, 'Protocol.js')
      )
    }
    return this._hasProtocols[name]
  }

  static reset() {
    this._hasProtocols = {}
  }
}
module.exports = ActionProtocols
