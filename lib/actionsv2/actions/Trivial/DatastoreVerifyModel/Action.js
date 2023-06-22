const ActionBase = require("../../../base/ActionBase");

class DatastoreUpsert extends ActionBase {
  async perform() {
    this.validate();

    const res = await await this.fetchInternalAPI(this.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(this.body),
    });

    this.setHTTPResponseOutput(res, await res.json());

    return true;
  }

  validate() {
    if (!this.inputValue.records) {
      throw new Error("Please provide records parameter");
    }
    if (!this.inputValue.hostname) {
      throw new Error("Please provide hostname parameter");
    }
    if (!this.inputValue.table_name) {
      throw new Error("Please provide tableName parameter");
    }
    if (!this.inputValue.unique_keys) {
      throw new Error("Please provide uniqueKeys parameter");
    }
    if (this.inputValue.records.length === 0) {
      throw new Error("Records value is an empty list");
    }
  }

  get hostname() {
    return this.inputValue.hostname;
  }

  get body() {
    let body = this.inputValue;
    return {
      records: body.records,
      table_name: body.table_name,
      unique_keys: body.unique_keys,
      nested_tables: body.nested_tables,
      customer_token: body.customer_token,
      apply_table_changes: body.apply_table_changes,
    };
  }

  get url() {
    return `${this.hostname}/datastore/verify_model`;
  }
}

module.exports = DatastoreUpsert;
