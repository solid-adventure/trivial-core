const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class StopDescriptor extends ActionDescriptorBase {
  get embedTransform() {
    return false
  }

  get fullDescriptionHTML() {
    return `Stops the execution of your application. 
    <h2>Overview</h2>
    Actions after Stop will not be performed, regardless of how deeply the Stop action is nested.   
    <h2>Requirements</h2>
    None
    `
  }

  get iconUrl() {
    return '/assets/images/action-icons/stop.svg'
  }

}
module.exports = StopDescriptor
