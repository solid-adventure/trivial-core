const ActionDescriptorBase = require("../../../base/ActionDescriptorBase");

class CreateShipCoShipmentDescriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {
    let h = `
    This action allows you to create a shipment for your Ship&Co account.   
    <h2>Overview</h2>
    <p>You can use this action to create shipments with details such as to and from addresses, parcels, products, and more.</p>
    <h2>You Will Need</h2>
    <ol>
      <li>A <a href="https://www.shipandco.com/en/" target="_blank">Ship&Co</a> account</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return "/assets/images/action-icons/shipco.svg";
  }

  get expectedTypeName() {
    return "CreateShipCoShipment";
  }

  getCredentialTypes(){
    return {
      shipco: {type: 'ShipCoCredentials', required: true}
    }
  }
}

module.exports = CreateShipCoShipmentDescriptor;
