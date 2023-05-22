const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class UpsertDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>Effectively a "Create or Update" action, Upsert allows you to update or insert rows based on a unique key.
    On update, any values present <strong>will be overwritten</strong>. Columns that aren't present in the request will be ignored.</p>
    <h2>Requirements</h2>
    <ol>
      <li>Postgres table must have a unique key or uniqueness constraint</li>
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
    return 'Upsert'
  }

}
module.exports = UpsertDescriptor