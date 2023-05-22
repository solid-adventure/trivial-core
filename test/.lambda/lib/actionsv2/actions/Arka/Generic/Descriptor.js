const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class ArkaDescriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>This action allows you make authenticated API calls using an Arka API key.</p>
    <p>Query parameters and body parameters can be appended to calls.</p>
    <h2>Requirements</h2>
    <ol>
      <li>Arka account</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/arka.svg'
  }

  getCredentialTypes() {
    return {
      arka: { type: 'ArkaCredentials', required: true }
    }
  }

  get expectedTypeName() {
    return 'GenericArka'
  }

}

module.exports = ArkaDescriptor


