const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

const TITLE_SUBSTITUTES = [
  ['===', 'is'],
  ['==', 'is'],
  ['!==', 'is not'],
  ['!=', 'is not'],
  ['!', 'not'],
  ['&&', 'and'],
  ['||', 'or'],
  ['>=', 'greater than or equal'],
  ['<=', 'less than or equal'],
  ['>', 'greater than'],
  ['<', 'less than'],
  ['++', 'plus one'],
  ['--', 'minus one'],
  ['+', 'plus'],
  ['-', 'minus'],
  ['**', 'to the power of'],
  ['*', 'times'],
  ['/', 'divided by'],
]
const TITLE_SUBSTITUTES_REGEX = new RegExp(
  TITLE_SUBSTITUTES
    .map(entry => {
      const [expr, subst] = entry
      return expr
        .split('')
        .map(c => c.charCodeAt(0).toString(16))
        .map(c => {
          while (c.length < 4) {
            c = `0${c}`
          }
          return `\\u${c}`
        })
        .join('')
    })
    .join('|')
, 'g')
    const TITLE_SUBSTITUTES_MAP = Object.fromEntries(TITLE_SUBSTITUTES)

class IfDescriptor extends ActionDescriptorBase {
  getDefinitionFields() {
    return {
      condition: {type: String, required: true}
    }
  }

  get fullDescriptionHTML() {
    let h = `
    Perform a set of actions conditionally. 
    <h2>Overview</h2>
    Choose a condition and a set of actions to perform when the requirement is met. Optionally, specify a separate set of actions to perform when the requirement has not been met.
    <h2>Requirements</h2>

    None
    `
    return h
  }

  get name() {
    return 'If -> Then'
  }

  set name(value) {

  }

  get actionSlots() {
    return ['then', 'else']
  }

  get iconUrl() {
    return '/assets/images/action-icons/if.svg'
  }

  definitionTitle(definition) {
    if (definition.name) {
      return definition.name
    }

    let title = `If ${definition.definition.condition || ''}`
    title = title.replace(TITLE_SUBSTITUTES_REGEX, match => ` ${TITLE_SUBSTITUTES_MAP[match]} `)
    title = title.replace(/[^0-9A-Za-z_.,\"\'\s]+/g, ' ')
    title = title.replace(/\s+/, ' ')

    return title
  }

  get embedTransform() {
    return false
  }
}
module.exports = IfDescriptor
