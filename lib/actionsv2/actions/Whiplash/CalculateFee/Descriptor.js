  const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class CalculateFee extends ActionDescriptorBase {
  // get fullDescriptionHTML() {
  //   let h = `
    
  //   <h2>Overview</h2>
  //   <p>This action allows you make authenticated API calls using Whiplash credentials.</p>
  //   <p>Attributes in addition to path and method will be added to the query as key/value pairs</p>
  //   <h2>Requirements</h2>
  //   <ol>
  //     <li>Whiplash account</li>
  //   </ol>
  //   `;
  //   return h;
  // }

  get iconUrl() {
    return '/assets/images/action-icons/whiplash.png'
  }

  // Define this type in CredentialType.js
  // getCredentialTypes(){
  //   return {
  //     whiplash: {type: 'WhiplashCredentials', required: true}
  //   }
  // }

  get expectedTypeName() {
    return 'OrderFees'
  }

}

module.exports = CalculateFee


