const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class QueryDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    
  <h2>Instructions</h2>
   <ol>
     <li>Enter a prompt and hit <strong>Generate Query</strong></li>
     <li>If the query looks OK, hit <strong>Preview</strong> to see the results</li>
   </ol>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/magic-query.svg'
  }

  // Allow users to pass fields in addition to those listed on the schema
  get allowFieldCreation() {
    return false
  }

  getCredentialTypes(){
    return {
      PostgreSQL: {type: 'PostgreSQLCredentials', required: true}
    }
  }

  get expectedTypeName() {
    return 'MagicQuery'
  }

}
module.exports = QueryDescriptor