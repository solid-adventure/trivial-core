const ActionBase = require('../../base/ActionBase')

class SendSMS extends ActionBase {
  async perform() {
    const res = await this.fetchInternalAPI(
      'https://8ca3320803f995.trivialapps.io/webhooks/receive',
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(this.inputValue)
      }
    )

    this.setHTTPResponseOutput(res, await res.text())

    return true
  }
}

module.exports = SendSMS
