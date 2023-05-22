const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class GetCatalogDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>Fetch catalog items from Square using the List Catalog endpoint.<p>
    </p>See the action Square/Get Orders for setup instructions. The setup instructions only need to be done once, and can be shared by all of your apps.</p>
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
    return 'SquareGetCatalog'
  }

}
module.exports = GetCatalogDescriptor

