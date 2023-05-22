const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class SendSMSDescriptor extends ActionDescriptorBase {
  getCredentialTypes() {
    return {
      twilio: {type: 'TwilioCredentials', required: true}
    }
  }

  get iconUrl() {
    return '/assets/images/action-icons/twilio.svg'
  }

  get expectedTypeName() {
    return 'TwilioOutboundMessage'
  }
}
module.exports = SendSMSDescriptor
