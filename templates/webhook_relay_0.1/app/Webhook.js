const fetch = require('node-fetch')
const Redactions = require('./lib/Redactions')
const Application = require('./Application')
const manifest = require('./manifest')

module.exports = class Webhook {
  constructor(appId, req, res, logTo) {
    this.appId = appId
    this.req = req
    this.res = res
    this.logTo = logTo
    this.diagnostics = {errors: [], events: []}
    this.startTime = Date.now()
  }

  get contentReceived() {
    return this.req.body
  }

  get source() {
    return this.req.headers["x-forwarded-for"] || this.req.hostname
  }

  get logger() {
    return this.req.log
  }

  logEvent(event, success, detail) {
    this.logger.info({event, success, detail}, `[Webhook][event] ${event}`)
    this.diagnostics.events.push(
      JSON.parse(Redactions.redact({time: new Date().toISOString(), event, success, detail}))
    )
  }

  logError(err) {
    this.logger.error({err}, '[Webhook][error] Application failed')
    this.diagnostics.errors.push(err)
  }

  get serializedErrors() {
    return this.diagnostics.errors.map(err => {
      return {
        name: (err || {}).name,
        message: (err || {}).message,
        stack: (err || {}).stack
      }
    })
  }

  get logStartPayload() {
    return {
      app_id: this.appId,
      payload: this.contentReceived,
      source: this.source,
      topic: this.topic
    }
  }

  get logEndPayload() {
    return {
      status: this.status,
      duration_ms: Date.now() - this.startTime,
      diagnostics: {
        filters: manifest.filters,
        errors: this.serializedErrors,
        events: this.diagnostics.events
      }
    }
  }

  get logToUrl() {
    return this.logTo.url
  }

  get fetch() {
    return async (...args) => {
      let method = (args[1] || {}).method || 'GET'
      this.logEvent(`${method}`, true, {url: args[0], ...(args[1] || {})})
      return fetch(...args)
    }
  }

  async getLogUpdateId() {
    if (! this.logCall) {
      throw new Error('Cannot update webhook log entry. Initial log entry was not made.')
    }
    const res = await this.logCall
    if (! res.ok) {
      throw new Error(`Failed to log webhook: ${res.status} ${res.statusText}`)
    }
    const body = await res.json()
    if ('string' !== typeof body.update_id) {
      throw new Error('Cannot update webhook log entry. No update id was provided.')
    }
    return body.update_id
  }

  async process() {
    this.logger.debug('[Webhook][process] running')

    this.logWebhookStart()
    this.status = await this.performApplication()
    await this.logWebhookEnd()

    return this.status
  }

  async performApplication() {
    try {
      const app = new Application(
        this.contentReceived,
        manifest,
        {
          logger: this.logger,
          diagnostics: this.diagnostics,
          request: this.req,
          response: this.res
        }
      )
      const result = await app.perform(this.fetch)
      this.topic = result.topic
      let status = 200
      if (this.res.headersSent) {
        status = this.res.statusCode
      } else if (result.status > 0) {
        status = result.status
      }
      this.logEvent(`Returned ${status}`, this.successFromStatus(status))
      return status
    } catch (err) {
      this.logError(err)
      return 500
    }
  }

  successFromStatus(status) {
    if (!status) { return false }
    if (status >= 200 && status < 400) { return true }
    if (status >= 400) { return false }
  }

  logWebhookStart() {
    try {
      // DO NOT AWAIT fetch call
      // logging call proceeds asynchronously as we work, we wait for the response at the end
      this.logCall = fetch(this.logToUrl, {
        method: this.logTo.verb,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.logStartPayload)
      })
      this.logger.info('[Webhook][logWebhookStart] Logging webhook start')
    } catch (err) {
      this.logger.error({err}, '[Webhook][logWebhookStart] Unable to write to log server')
    }
  }

  async logWebhookEnd() {
    try {
      const updateId = await this.getLogUpdateId()
      let response = await fetch(`${this.logToUrl}/${updateId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.logEndPayload)
      })
      this.logger.info({status: response.status}, '[Webhook][logWebhook] Webhook logged')
    } catch (err) {
      this.logger.error({err}, '[Webhook][logWebhook] Unable to write to log server')
    }
  }
}
