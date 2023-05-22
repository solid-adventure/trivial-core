  const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class GenericDescriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>This action allows you to make authenticated API calls to the Square API using the OAuth2 protocol.</p>
    <p>Oauth Redirect in Square should be set to <code>${this.oauth2RedirectUrl}</code></p>
    <p>RecordType is required to support pagination. </p>
    <h2>Requirements</h2>
    <ol>
      <li>Square Seller's Account</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/square.png'
  }

  getCredentialTypes(){
    return {
      Square: {type: 'SquareCredentials', required: true}
    }
  }

  get expectedTypeName() {
    return 'GenericSquare'
  }

}

module.exports = GenericDescriptor
