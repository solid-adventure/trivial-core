const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class GetOrdersDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    <h2>Overview</h2>
    <p>Fetch orders from your Squarespace store.</p>
    <h2>Requirements</h2>
    <ol>
      <li>Squarespace "Commerce" plan</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/squarespace.png'
  }

  getCredentialTypes(){
    return {
      Squarespace: {type: 'SquarespaceCredentials', required: true}
    }
  }

  get expectedTypeName() {
    return 'SquarespaceGetOrders'
  }

  // Actions do not have access to these fields in perform() { this.inputValues }
  // If you need to access fields directly in the action, use expectedTypeName and set a Schema
  // getDefinitionFields() {
  //   return {
  //     example: {type: String, required: true, default: "[1,2,3]"},
  //     expression: {type: String, required: true, default: "item"}
  //   }
  // }

  // Uncomment to perform custom behavior when this action is added to the builder
  // async afterAdd({app, definition, credentials}) {
  //   return true
  // }

}
module.exports = GetOrdersDescriptor

