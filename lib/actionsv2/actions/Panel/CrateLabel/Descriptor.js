const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class CrateLabelDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>This action formats a response to render a Crate Label layout</p>
    <h2>Requirements</h2>
    <ol>
      <li>None</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/trivial.svg'
  }

  get expectedTypeName() {
    return 'CrateLabel'
  }


}
module.exports = CrateLabelDescriptor