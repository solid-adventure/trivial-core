const MailgunAction = require('../ActionBase')

class SendEmail extends MailgunAction {
  get method() {
    return 'POST'
  }

  get actionPath() {
    return `/${encodeURIComponent(this.config.mailgun.domain)}/messages`
  }
}

module.exports = SendEmail
