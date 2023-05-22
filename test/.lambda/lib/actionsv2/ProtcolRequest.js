const fetch = require('node-fetch')

class ProtocolRequest {
  // valid options are:
  //  - config
  //  - credentialSet
  //  - logger
  //  - req
  constructor(options) {
    this.options = options || {}
  }

  get config() {
    return this.options.config || {}
  }

  get credentialSet() {
    return this.options.credentialSet
  }

  get logger() {
    return this.options.logger || console
  }

  get req() {
    return this.options.req
  }

  get body() {
    return (this.req || {}).body
  }

  async fetch(...args) {
    let method = (args[1] || {}).method || 'GET'
    this.logger.debug(`[ProtocolRequest] ${method} ${args[0]}`)
    return fetch(...args)
  }
}

module.exports = ProtocolRequest
