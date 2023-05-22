const ActionBase = require('../../base/ActionBase')

class AirtableAction extends ActionBase {
  async perform(){
    let res = await this.fetch(this.url, {
      method: this.method,
      headers: this.headers,
    })

    this.logger.info(
      {status: res.status, url: this.url, body: this.body},
      `[${this.name}][perform] complete`
    )

    this.setHTTPResponseOutput(res, await res.json());

    return true
  }

  get actionPath() {
    return `/${this.config.airtable.base_id}/${encodeURIComponent(this.config.airtable.table_name)}`
  }

  get url() {
    return `${this.baseURL}${this.actionPath}`
  }

  get headers() {
    return {
      'Authorization': `Bearer ${this.config.airtable.api_key}`
    }
  }

  get baseURL() {
    return 'https://api.airtable.com/v0'
  }
}

module.exports = AirtableAction
