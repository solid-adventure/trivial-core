const ActionBase = require("../../../base/ActionBase");

class ListShipCoShipments extends ActionBase {
  async perform() {
    let url = `https://app.shipandco.com/api/v1/shipments?${this.formEncoded(
      this.inputValue
    )}`;

    const res = await this.fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `${this.config.shipco.api_token}`,
      },
    });

    this.setHTTPResponseOutput(res, await res.json());

    return true;
  }

  static get redactPaths() {
    return ['*.headers["x-access-token"]'];
  }
}

module.exports = ListShipCoShipments;
