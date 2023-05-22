  const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class {{Action}}Descriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>This action allows you to do something new.</p>
    <h2>Requirements</h2>
    <ol>
      <li>Something special, like an account for the service</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/trivial.svg'
  }

  // Define this type in CredentialType.js
  getCredentialTypes(){
    return {
      {{service}}: {type: '{{Service}}Credentials', required: true}
    }
  }

  get expectedTypeName() {
    return '{{action}}'
  }

}

module.exports = {{Action}}Descriptor


// To add this action to the builder, you must add a reference in
// source/lib/actionsv2/catalog/ActionDescriptors.js