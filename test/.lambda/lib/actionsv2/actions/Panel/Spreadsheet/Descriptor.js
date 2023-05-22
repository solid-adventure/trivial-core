const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class SpreadsheetDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    
    <h2>Overview</h2>
    <p>This action allows you to render a spreadsheet of your data.</p>
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
    return 'Spreadsheet'
  }

}
module.exports = SpreadsheetDescriptor