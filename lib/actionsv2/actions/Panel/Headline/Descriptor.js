const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class HeadlineDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    <h2>Overview</h2>
    <p>Creates a UI card with a number in large type.</p>
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
    return 'PanelHeadline'
  }

  // Uncomment to perform custom behavior when this action is added to the builder
  // async afterAdd({app, definition, credentials}) {
  //   return true
  // }

}
module.exports = HeadlineDescriptor