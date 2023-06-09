const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class {{action}}Descriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>This action allows you to do something new.</p>
    <h2>Requirements</h2>
    <ol>
      <li>Something special, like an account for the service</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/trivial.svg'
  }

  getCredentialTypes(){
    return {
      {{serviceName}}: {type: '{{service}}Credentials', required: true}
    }
  }

  // Actions do not have access to these fields in perform() { this.inputValues }
  // If you need to access fields directly in the action, use expectedTypeName and set a Schema
  // getDefinitionFields() {
  //   return {
  //     example: {type: String, required: true, default: "[1,2,3]"},
  //     expression: {type: String, required: true, default: "item"}
  //   }
  // }


  // Note: You must import your Schema definition at source/lib/TrivialSchemas.js
  get expectedTypeName() {
    return '{{action}}'
  }

  // Uncomment to perform custom behavior when this action is added to the builder
  // async afterAdd({app, definition, credentials}) {
  //   return true
  // }

}
module.exports = {{action}}Descriptor


// To add this action to the builder, you must add a reference in
// source/lib/actionsv2/catalog/ActionDescriptors.js