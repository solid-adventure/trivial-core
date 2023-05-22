const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class AirtableActionDescriptor extends ActionDescriptorBase {
  getCredentialTypes(){
    return {
      airtable: {type: 'AirtableCredentials', required: true}
    }
  }

  get iconUrl() {
    return '/assets/images/action-icons/airtable.svg'
  }
}

module.exports = AirtableActionDescriptor
