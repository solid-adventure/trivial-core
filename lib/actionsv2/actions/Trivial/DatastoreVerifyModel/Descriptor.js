const ActionDescriptorBase = require("../../../base/ActionDescriptorBase");

class DatastoreUpsertDescriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>Verify Model in the Trivial Datastore.</p>
    <p>Useful for creating/updating/verifying your Trivial Datastore tables using input JSON data.</p>
    <p>Must provide a list of records, destination table name, and unique column keys for matching existing tables. Model changes will only be applied when \`apply_table_changes\` is set to \`true\`.</p>
    `;
    return h;
  }

  get iconUrl() {
    return "/assets/images/action-icons/trivial.svg";
  }

  get expectedTypeName() {
    return "DatastoreVerifyModel";
  }
  get configFields() {
    return {
      api_key: { type: String, required: true, secret: true, hidden: true },
    };
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
