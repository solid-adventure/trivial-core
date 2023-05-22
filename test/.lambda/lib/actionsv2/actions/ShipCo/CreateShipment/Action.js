const ActionBase = require("../../../base/ActionBase");

class CreateShipCoShipments extends ActionBase {
  async perform() {
    let res = await this.fetch(`https://app.shipandco.com/api/v1/shipments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `${this.config.shipco.api_token}`,
      },
      body: JSON.stringify(this.inputValue)
    });

    this.setHTTPResponseOutput(res,
       await res.text()
       .then(text => {
         let blob = JSON.parse(text, (key,value) => {
           if (key === 'invoice') return undefined
           return value
         })
         return blob
       })
    );

    return true;
  }

  static get redactPaths() {
    return ['*.headers["x-access-token"]'];
  }
}

module.exports = CreateShipCoShipments;
