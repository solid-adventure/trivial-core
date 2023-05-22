const ActionBase = require('../../../base/ActionBase')

class SendSMS extends ActionBase {
  async perform() {
    let res = await this.fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.config.twilio.account_sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          ...this.basicAuthHeader(this.config.twilio.account_sid, this.config.twilio.auth_token)
        },
        body: this.formEncoded(this.inputValue)
      }
    )

    this.setHTTPResponseOutput(res, await res.json());

    return true
  }
}

module.exports = SendSMS
