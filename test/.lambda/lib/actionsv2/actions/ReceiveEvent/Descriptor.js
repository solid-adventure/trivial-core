const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class ReceiveEventDescriptor extends ActionDescriptorBase {
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
    return 'ReceiveEvent'
  }

  static get isUserSearchable() {
    return false
  }
}

module.exports = ReceiveEventDescriptor
