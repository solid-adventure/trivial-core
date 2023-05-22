const ActionDescriptorBase = require("../../../base/ActionDescriptorBase");

class CreateShipCoRateDescriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {
    let h = `
    This action allows you to get a list of available services and rates for a shipment.
    <h2>Overview</h2>
    <p>Options are the same as Create Shipment. The <strong>service</strong> attribute is ignored.</p>
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
    return "CreateShipCoRate";
  }

  getCredentialTypes(){
    return {
      shipco: {type: 'ShipCoCredentials', required: true}
    }
  }
}

module.exports = CreateShipCoRateDescriptor;
