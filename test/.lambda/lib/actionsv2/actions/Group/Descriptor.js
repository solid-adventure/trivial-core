const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class GroupDescriptor extends ActionDescriptorBase {
  get actionSlots() {
    return ['actions']
  }

  definitionTitle(definition) {
    return super.definitionTitle(definition) || 'Group'
  }

  get embedTransform() {
    return false
  }
}
module.exports = GroupDescriptor
