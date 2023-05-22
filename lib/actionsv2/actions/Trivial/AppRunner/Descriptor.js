const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class AppRunnerDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>Runs another Trivial app.</p>
    <p>Useful to run a target app with variable parameters, such as while iterating over a list.</p>
    <p>Any Custom Fields present will be added as key/value pairs and available in the target app's <code>initialPayload</code>.</p>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/trivial.svg'
  }

  // getCredentialTypes(){
  //   return {
  //     Trivial: {type: 'TrivialCredentials', required: true}
  //   }
  // }

  get expectedTypeName() {
    return 'AppRunner'
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
module.exports = AppRunnerDescriptor

