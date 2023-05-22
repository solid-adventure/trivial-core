const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class MailgunActionDescriptor extends ActionDescriptorBase {
  getCredentialTypes(){
    return {
      mailgun: {type: 'MailgunCredentials', required: true}
    }
  }

  get iconUrl() {
    return '/assets/images/action-icons/mailgun.svg'
  }
}

module.exports = MailgunActionDescriptor
