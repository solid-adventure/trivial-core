const jwt = requireNodeOnly('jsonwebtoken')

class ApiKey {
  // valid options:
  //  - key: key to use for verifying signature
  constructor(token, options) {
    this.token = token
    this.options = options || {}
  }

  isValid(ignoreExpiration = false) {
    try {
      jwt.verify(this.token, this.publicKey, {algorithms: ['RS256'], ignoreExpiration})
      return true
    } catch (e) {
      return false
    }
  }

  isExpired() {
    return this.willExpire(0)
  }

  willExpire(within) {
    if ('undefined' !== typeof this.expiration) {
      const now = Math.floor(Date.now() / 1000)
      return Number(this.expiration) <= now + Number(within)
    } else {
      return false
    }
  }

  get appId() {
    return this.payload.app
  }

  get expiration() {
    return this.payload.exp
  }

  get payload() {
    // note: this does not verify the signature, you must call isValid() to do that
    return this._payload = this._payload || jwt.decode(this.token, this.publicKey)
  }

  get publicKey() {
    return this.options.key
  }
}

module.exports = ApiKey

function requireNodeOnly(id) {
  if ('function' === typeof require && 'undefined' !== typeof process) {
    const nodeRequire = require // force webpack to ignore the call
    return nodeRequire(id)
  }
}
