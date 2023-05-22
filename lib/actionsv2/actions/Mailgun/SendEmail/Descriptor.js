const MailgunActionDescriptor = require('../DescriptorBase')

class SendEmailDescriptor extends MailgunActionDescriptor {
  get expectedTypeName() {
    return 'MailgunOutboundEmail'
  }
}

module.exports = SendEmailDescriptor
