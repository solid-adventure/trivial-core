const ActionDescriptorBase = require('../../base/ActionDescriptorBase')


class EventRuleDescriptor extends ActionDescriptorBase {
  getDefinitionFields() {
    return {
      condition: {type: String, required: true, editorComponent: 'Condition'}
    }
  }

  // get fullDescriptionHTML() {
  //   let h = `
  //   `
  //   return h
  // }

  get name() {
    return 'Rule'
  }

  set name(value) {

  }

  get actionSlots() {
    return ['then']
  }

  get editorComponent() {
    return 'EventRule'
  }



  // get iconUrl() {
  //   return '/assets/images/action-icons/if.svg'
  // }

  // definitionTitle(definition) {
  //   if (definition.name) {
  //     return definition.name
  //   }

  //   let title = `If ${definition.definition.condition || ''}`
  //   title = title.replace(TITLE_SUBSTITUTES_REGEX, match => ` ${TITLE_SUBSTITUTES_MAP[match]} `)
  //   title = title.replace(/[^0-9A-Za-z_.,\"\'\s]+/g, ' ')
  //   title = title.replace(/\s+/, ' ')

  //   return title
  // }

  get embedTransform() {
    return false
  }
}
module.exports = EventRuleDescriptor
