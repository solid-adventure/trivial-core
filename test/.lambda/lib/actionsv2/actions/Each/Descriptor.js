const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class EachDescriptor extends ActionDescriptorBase {
  getDefinitionFields() {
    return {
      list: {type: String, required: true, default: "[1,2,3]"},
      item_name: {type: String, required: true, default: "item"}
    }
  }

  get fullDescriptionHTML() {
    let h = `
    Perform a set of actions on each item in a list. 
    <h2>Overview</h2>
    A common programming task to manipulate each item on a list. Choose a name you'd like each member to be known by, so you can refer to the current member in your actions.
    <h2>Requirements</h2>
    None
    `
    return h
  }

  get iconUrl() {
    return '/assets/images/action-icons/each.svg'
  }

  get actionSlots() {
    return ['actions']
  }

  get embedTransform() {
    return false
  }
}
module.exports = EachDescriptor
