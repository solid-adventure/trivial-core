  const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class WhiplashDescriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>This action allows you to fetch orders from Whiplash.</p>
    <h2>Requirements</h2>
    <ol>
      <li>Whiplash account</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/whiplash.png'
  }

  // Define this type in CredentialType.js
  getCredentialTypes(){
    return {
      whiplash: {type: 'WhiplashCredentials', required: true}
    }
  }

  get expectedTypeName() {
    return 'GetOrders'
  }

}

module.exports = WhiplashDescriptor


