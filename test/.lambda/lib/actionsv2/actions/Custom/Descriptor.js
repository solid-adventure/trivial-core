const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class CustomDescriptor extends ActionDescriptorBase {

  get fullDescriptionHTML() {
    let h = `
    Execute a custom block of JavaScript.
    <h2>Overview</h2>
    <p>This action accepts the payload from the previous step and processes with your custom logic.
    The results will be available to the next action in the <em>payload</em> variable. </p>
    <h2>Requirements</h2>
    JavaScript knowledge
    `;
    return h;
  }

  get iconUrl() {
    return '/assets/images/action-icons/custom.svg'
  }

  // Prevent the parent class from returning 'Java Script Block'
  get descriptiveName() {
    return 'JavaScript Block'
  }

  get name() {
    return 'JavaScript Block'
  }

  set name(value) {

  }

  getDefinitionFields() {
    return {
      code: {type: String, required: true, default: `this.logEvent('[Custom Block]', true, payload)\nreturn payload`, editorComponent: 'JavascriptEditor'}
    }
  }

  get embedTransform() {
    return false
  }

}
module.exports = CustomDescriptor
