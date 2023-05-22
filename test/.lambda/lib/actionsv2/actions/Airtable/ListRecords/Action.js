const AirtableAction = require('../ActionBase')

class ListRecords extends AirtableAction {

  async perform() {

    // If we have a user configuration, store it on the object for future cycles
    if (this.inputValue.maxRows) {
      this.maxRows = this.inputValue.maxRows
      delete this.inputValue.maxRows
    // If we don't have a user configuration and we're not defined, use the default
    } else if (!this.maxRows) {
      this.maxRows = 300
    }

    let res = await this.fetch(this.url, {
        method: 'GET',
        headers: this.headers
      })
    let result = await res.json()

    this.records = (typeof this.records == 'undefined') ? [] : this.records
    this.records.push(result.records)
    this.recordsCount = (typeof this.recordsCount == 'undefined') ? 0 : this.recordsCount
    this.recordsCount += result.records.length

    let offset = result.offset
    if (offset && this.recordsCount < this.maxRows) {
      this.inputValue.offset = offset
      await this.perform()
    }
    this.setHTTPResponseOutput(res, {
      records: this.records.flat(),
      count: this.recordsCount
    });

    return true
  }

  get url() {
    let url =  `${this.baseURL}${this.actionPath}`
    if(this.inputValue){ url += `?${this.formEncoded(this.inputValue)}` }
    return url
  }
}

module.exports = ListRecords
