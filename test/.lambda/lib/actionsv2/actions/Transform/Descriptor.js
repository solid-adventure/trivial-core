const ActionDescriptorBase = require('../../base/ActionDescriptorBase')
const { arrayOf, schema } = require('../../../schema-utils')

class TransformDescriptor extends ActionDescriptorBase {
  getDefinitionFields() {
    return {
      from: {type: String, required: true, default: "GenericObject"},
      to: {type: String, required: true, default: "GenericObject"},
      transformations: {editorComponent: 'Transformations', type: arrayOf(
        schema({
          fields: {
            from: {type: String, required: true},
            to: {type: String, required: true}
          }
        })
      )}
    }
  }

  get embedTransform() {
    return false
  }
}
module.exports = TransformDescriptor
