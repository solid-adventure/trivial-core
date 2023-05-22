const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class QueryDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>Perform a query against a MySQL database</p>
    <h2>Requirements</h2>
    <ol>
      <li>MySQL credentials</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/mysql.png'
  }

  getCredentialTypes(){
    return {
      MySQL: {type: 'MySQLCredentials', required: true}
    }
  }

  get expectedTypeName() {
    return 'MySQLQuery'
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
module.exports = QueryDescriptor

