const fastRedact = require('fast-redact')

class Redactions {
  static get paths() {
     return this._paths = this._paths || [
      '*.body.api_key',
      '*.body.credentials',
      '*.body.current_password',
      '*.body.password',
      '*.body.password_confirmation',
      '*.headers["access-token"]',
      '*.headers.Authorization',
      '*.headers.authorization',
      '*.headers.client',
      '*.headers.cookie',
      '*.headers["set-cookie"]',
    ]
  }

  static get redactor() {
    return this._redactor = this._redactor || fastRedact({paths: this.paths})
  }

  static redact(obj) {
    return this.redactor(obj)
  }

  static addActionPaths(actionClass) {
    const redactPaths = actionClass ? actionClass.redactPaths : undefined
    if (redactPaths) {
      const newPaths = actionClass.redactPaths.filter(p => -1 === this.paths.indexOf(p))
      this._paths = this.paths.concat(newPaths)
      delete this._redactor
    }
  }
}

module.exports = Redactions
