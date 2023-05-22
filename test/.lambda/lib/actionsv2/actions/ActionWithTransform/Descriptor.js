const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class ActionWithTransformDescriptor extends ActionDescriptorBase {
  get actionSlots() {
    return ['actions']
  }

  get contentsUserVisible() {
    return false
  }

  get embedTransform() {
    return false
  }

  get editorComponent() {
    return 'ActionWithTransform'
  }

  static get isUserSearchable() {
    return false
  }

  async afterAdd(context) {
    const transform = context.definition.definition.actions[0]
    const action = context.definition.definition.actions[1]

    const ActionDescriptors = require('../../catalog/ActionDescriptors')
    const transformDescr = ActionDescriptors.forType(transform.type)
    await transformDescr.invokeHook(
      'afterAdd', {...context, action, transform, definition: transform}
    )

    const actionDescr = ActionDescriptors.forType(action.type)
    await actionDescr.invokeHook(
      'afterAdd',  {...context, action, transform, definition: action}
    )
  }
}
module.exports = ActionWithTransformDescriptor
