const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class ReceiveWebhookDescriptor extends ActionDescriptorBase {
  // get iconUrl() {
  //   return '/assets/images/action-icons/webhook-relay.svg'
  // }

  get actionSlots() {
    return ['actions']
  }

  get embedTransform() {
    return false
  }

  get editorComponent() {
    return 'ReceiveWebhook'
  }

  static get isUserSearchable() {
    return false
  }
}

module.exports = ReceiveWebhookDescriptor
