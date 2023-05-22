class ActionInput {
  // options include:
  //  * logger - A logger to use. must provide trace, debug, info, warn, and error methods
  //  * diagnostics - An object for recording diagnostics. must have errors and events properties
  //  * request - An object the represents the incoming request
  //  * response - An object that represents the outgoing response
  //  * config - Input configuration
  //  * origConfig - config without the credentials and environment variables resolved
  //  * inputName - The value to read input from
  //  * outputName - The value to write output to
  //  * values
  //  * additionalParams - Additional params that will be available to the action
  constructor(context) {
    this.context = context || {}
    this.diagnostics = this.context.diagnostics || {errors: [], events: []}
  }

  get logger() {
    return this.context.logger || console
  }

  get config() {
    return this.context.config || {}
  }

  get request() {
    return this.context.request
  }

  get response() {
    return this.context.response
  }

  get values() {
    return this.context.values || {}
  }

  get additionalParams() {
    return this.context.additionalParams || {}
  }

  get inputName() {
    return this.context.inputName || 'payload'
  }

  get inputValue() {
    return this.values[this.inputName]
  }

  get outputName() {
    return this.context.outputName || 'payload'
  }
}

module.exports = ActionInput
