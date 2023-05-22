const OAuth2ActionBase = require('../../../base/OAuth2ActionBase')

class Generic extends OAuth2ActionBase {

  async perform() {
    let [url, config] = this.beforePerform({
      'content-type': 'application/json',
      'Square-Version': '2022-08-23'
    })

    const res = await this.fetchWithAuth(url.href, config)

    // Stop if any result is not ok
    if (res.status != 200) {
      this.setHTTPResponseOutput(res, await res.json())
      return true
    }

    // Fetch the results and run again if there are additional pages
    let body = await res.json()
    await this.handlePagination(body)

    // Return the combined results when there are no more pages or we've hit the recordLimit limit
    if (this.completed) {
      this.setHTTPResponseOutput(res, this.customResponseBody)
      return true
    }

    return true
  }

  beforePerform(headers) {
    this.records = (typeof this.records == 'undefined') ? [] : this.records
    this.setRecordLimit()

    let url = new URL(`${this.inputValue.baseURL}${this.inputValue.path}`)
    let config = {
      method: this.inputValue.method,
      headers
    }
    if (this.inputValue.searchParams || this.inputValue.body) [url,config] = this.addParams(url, config)
    return [url, config]
  }

  addParams(url,config){
    if (this.inputValue.searchParams) {
      for (let key of Object.keys(this.inputValue.searchParams)) {
        url.searchParams.set(key, this.inputValue.searchParams[key])
      }
    }
    if (this.inputValue.body) config.body = JSON.stringify(this.inputValue.body)
    return [url, config]
  }

  async handlePagination(body) {
    if (typeof this.inputValue.recordType === 'undefined') {
      this.records = [body] // set records to single response
      this.completed = true
      return true
    }
    this.records = this.records.concat(body[this.inputValue.recordType])
    this.logEvent('Paginator With New Results', true, {recordCount: this.recordCount, recordLimit: this.recordLimit})

    if (body && body.cursor) {
      this.cursor = body.cursor
    } else {
      this.completed = true
    }

    if (this.recordCount >= this.recordLimit) {
      this.completed = true
    }

    if (!this.completed) {
      await this.perform()
    }
    return true
  }

  setRecordLimit() {
    try {
      // If we have a user configuration, store it on the object for future cycles
      if (this.inputValue.body.limit) this.recordLimit = this.inputValue.body.limit
        // If we don't have a user configuration and we're not defined, use the default
      else if (!this.recordLimit) this.recordLimit = 200
    }
    catch (e) {
      this.recordLimit = 200
    }
  }

  get customResponseBody() {
    return {
      count: this.recordCount,
      records: this.records
    }
  }

  get recordCount() {
    // Filter empty results
    return this.records.filter(o => o).length
  }

  get refreshEnabled() {
    return true;
  }

  get credentialName() {
    return 'Square'
  }

  protocolHelper() {
    return require('../../../catalog/ActionProtocols').forType('Square')
  }
}

module.exports = Generic
