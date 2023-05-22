const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class CollectDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    Collect information from a list.
    <h2>Overview</h2>
    <p>This action calls an expression on each member of a list and returns a new list with the output.</p>
    <h2>Requirements</h2>
    None
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/trivial.svg'
  }

  getDefinitionFields() {
    return {
      list: {type: String, required: true, default: `[{name: "Vin", age: 21}, {name: "Phoebe", age: 34}]`},
      item_name: {type: String, required: true, default: "person"},
      expression: {type: String, required: true, default: "person.age"}
    }
  }

  get embedTransform() {
    return false
  }

}
module.exports = CollectDescriptor
