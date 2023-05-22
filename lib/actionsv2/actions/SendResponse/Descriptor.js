const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class SendResponseDescriptor extends ActionDescriptorBase {
  get expectedTypeName() {
    return 'HTTPResponse'
  }

  get iconUrl() {
    return '/assets/images/action-icons/trivial.svg'
  }
}
module.exports = SendResponseDescriptor
