const Redactions = require('../Redactions')

// DEPRECATED
// The last remaining v1 actions are Trivial SendEmail, SendSMS, etc.
// When those are ported to v2, this file can be deleted in favor of actionsv2/base/ActionBase.js

class ActionBase {
  // options include:
  //  * logger - A logger to use. must provide trace, debug, info, warn, and error methods
  //  * diagnostics - An object for recording diagnostics. must have errors and events properties
  //  * request - An object the represents the incoming request
  //  * response - An object that represents the outgoing response
  //  * origConfig - config without the credentials and environment variables resolved
  constructor(payload, config, options) {

    console.log('Deprecation Warning: Please use actionsv2/base/ActionBase.js instead.')

    this.payload = payload
    this.config = config
    this.options = options || {}
    this.diagnostics = this.options.diagnostics || {errors: [], events: []}
    this.request = this.options.request
    this.response = this.options.response
  }

  get logger() {
    return (this.options.logger || console)
  }

  get name() {
    return this.constructor && this.constructor.name ? this.constructor.name : '(action)'
  }

  logEvent(event, success, detail) {
    this.logger.info({event, success, detail}, `[${this.name}][event] ${event}`)
    this.diagnostics.events.push(
      JSON.parse(Redactions.redact({time: new Date().toISOString(), event, success, detail}))
    )
  }

  logError(err) {
    this.logger.error({err}, `[${this.name}][error] Error`)
    this.diagnostics.errors.push(err)
  }

  static get redactPaths() {
    return []
  }
}

module.exports = ActionBase
