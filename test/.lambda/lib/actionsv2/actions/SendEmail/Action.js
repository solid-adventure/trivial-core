const ActionBase = require('../../base/ActionBase')

class SendEmail extends ActionBase {
  async perform() {
    const res = await this.fetchInternalAPI(
      'https://2d07e0630036cf.trivialapps.io/webhooks/receive',
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

module.exports = SendEmail
