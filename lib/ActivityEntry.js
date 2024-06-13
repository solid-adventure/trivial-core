const Redactions = require('./Redactions')
const fetch = require('node-fetch')

class ActivityEntry {
  constructor(initialPayload, logToUrl, source) {
    this.initialPayload = initialPayload
    this.diagnostics = {errors: [], events: []}
    this.logToUrl = `${logToUrl}/webhooks`
    this.source = source
    this.startTime = Date.now()
    this.registerItemId = null
  }

  logEvent(event, success, detail) {
    this.diagnostics.events.push(
      JSON.parse(Redactions.redact({time: new Date().toISOString(), event, success, detail}))
    )
  }

  logStart(manifest) {
    this.manifest = manifest
    try {
      this.logCall = fetch(this.logToUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.logStartPayload)
      })
    } catch (err) {
      // TODO Pass a logger to capture errors when there's a problem with the API
      // this.logger.error({err}, '[ActivityEntry][logStart] Unable to write to activity entries')
    }
    return manifest
  }

  async logFinish() {
    try {
      const updateId = await this.getLogUpdateId()
      let response = await fetch(`${this.logToUrl}/${updateId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.logFinishPayload)
      })
    } catch (err) {
      // TODO Pass a logger to capture errors when there's a problem with the API
      // this.logger.error({err}, '[ActivityEntry][logFinish] Unable to write to activity entries')
    }
  }

  get appId() {
    return this.manifest.app_id
  }

  get logStartPayload() {
    return {
      app_id: this.appId,
      payload: this.initialPayload,
      source: this.source,
    }
  }

  get logFinishPayload() {
    return {
      status: this.serializedErrors.length > 0 ? 500 : 200,
      duration_ms: Date.now() - this.startTime,
      diagnostics: {
        errors: this.serializedErrors,
        events: this.diagnostics.events
      },
      register_item_id: this.registerItemId
    }
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

  async getLogUpdateId() {
    if (! this.logCall) {
      throw new Error('Cannot update ActivityEntry. Initial log entry was not made.')
    }
    const res = await this.logCall
    if (! res.ok) {
      throw new Error(`Failed to log ActivityEntry: ${res.status} ${res.statusText}`)
    }
    const body = await res.json()
    if ('string' !== typeof body.update_id) {
      throw new Error('Cannot update ActivityEntry log entry. No update id was provided.')
    }
    return body.update_id
  }

}

module.exports = ActivityEntry
