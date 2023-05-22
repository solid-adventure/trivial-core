const ActionDescriptorBase = require('../../base/ActionDescriptorBase')
const { schema, arrayOf } = require('../../../schema-utils')

class HttpRequestDescriptor extends ActionDescriptorBase {
  getConfigFields() {
    return {
      url: {type: String, required: true},
      method: {type: String, required: true},
      custom_headers: {required: false, type: arrayOf(
        schema({
          fields: {
            name: {type: String, required: true},
            value: {type: String, required: true}
          }
        })
      )}
    }
  }

  get iconUrl() {
    return '/assets/images/action-icons/trivial.svg'
  }
}
module.exports = HttpRequestDescriptor
