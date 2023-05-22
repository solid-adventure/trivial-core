const ActionBase = require('../../../base/ActionBase')

class AppRunner extends ActionBase {
  async perform() {

    this.validate()

    const res = await this.fetch( this.url,
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(this.body)
      }
    )

    this.setHTTPResponseOutput(res, await res.json())

    return true
  }

  validate() {
    if (typeof this.app_id == 'undefined') {
      throw new Error('Please provided an App ID.')
    }

    if (this.app_id == process.env.APP_ID) {
      throw new Error('AppRunner may not call itself, please provide the App ID of another app.')
    }
  }

  get app_id() {
    return this.inputValue.app_id.replace(/ /g, '')
  }

  get body() {
    let body = this.inputValue
    delete body.app_id
    return body
  }

  get url() {
    return `https://${this.app_id}.trivialapps.io/webhooks/receive`
  }

}

module.exports = AppRunner
