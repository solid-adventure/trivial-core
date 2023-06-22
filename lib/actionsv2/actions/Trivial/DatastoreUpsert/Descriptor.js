const ActionDescriptorBase = require("../../../base/ActionDescriptorBase");

class DatastoreUpsertDescriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>Upserts data into the Trivial Datastore.</p>
    <p>Useful for saving data from an integration API for advanced analytics or joining data together.</p>
    <p>Must provide a list of records, destination table name, and unique column keys for matching existing data.</p>
    `;
    return h;
  }

  get iconUrl() {
    return "/assets/images/action-icons/trivial.svg";
  }

  get expectedTypeName() {
    return "DatastoreUpsert";
  }
  get configFields() {
    return {
      api_key: {type: String, required: true, secret: true, hidden: true}
    }
  }

  async afterAdd({ app, definition, credentials }) {
    try {
      const key = await this.createAPIKey(app);
      this.setCredential(definition, credentials, "api_key", key);
    } catch (e) {
      console.error(`[${this.name}][afterAdd] Failed to create API key`, e);
    }
  }
}
module.exports = DatastoreUpsertDescriptor;
