const AirtableAction = require('../ActionBase')

class UpdateRecords extends AirtableAction {
    async perform() {
        let res = await this.fetch(this.url, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(this.inputValue)
          })
          this.setHTTPResponseOutput(res, await res.json());
          return true
    }
  get headers() {
    return {
      'Authorization': `Bearer ${this.config.airtable.api_key}`,
      'Content-Type': `application/json`
    }
  }

  
}


module.exports = UpdateRecords