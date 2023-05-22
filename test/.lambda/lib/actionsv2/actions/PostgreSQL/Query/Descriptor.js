const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class QueryDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>This action allows you to make SQL queries against a PostgreSQL database.</p>
    <h2>Requirements</h2>
    <ol>
      <li>PostgreSQL credentials</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/postgresql.png'
  }

  getCredentialTypes(){
    return {
      PostgreSQL: {type: 'PostgreSQLCredentials', required: true}
    }
  }

  get expectedTypeName() {
    return 'Query'
  }

}
module.exports = QueryDescriptor