const ActionDescriptorBase = require("../../../base/ActionDescriptorBase");

class ListShipCoShipmentsDescriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {
    let h = `
    This action allows you to see a list of your shipments.   
    <h2>Overview</h2>
    <p>You can use this action to list shipments details such as carriers, tracking numbers, addresses, and products. This action will access your Ship&Co account and get information from there.</p>
    <h2>You Will Need</h2>
    <ol>
      <li>A <a href="https://www.shipandco.com/en/" target="_blank">Ship&Co</a> account</li>
      <li>Some shipments created in your Ship&Co account</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return "/assets/images/action-icons/shipco.svg";
  }

  get expectedTypeName() {
    return "ListShipCoShipments";
  }

  getCredentialTypes(){
    return {
      shipco: {type: 'ShipCoCredentials', required: true}
    }
  }
}

module.exports = ListShipCoShipmentsDescriptor;
