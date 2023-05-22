const CodeReferenceIdentifier = require('./CodeReferenceIdentifier')
const { sanitizedIdentifier } = require('./code-utils')

class ReferenceManager {
  constructor(blockDefs, outputNames) {
    this.blocks = blockDefs
    this.exportedNames = (this.blocks || []).map(b => sanitizedIdentifier(b.name))
    this.outputNames = outputNames || []
  }

  hasRequireStatements() {
    return this.blocks && this.blocks.length > 0
  }

  requireStatements() {
    if (this.hasRequireStatements()) {
      return "const $utils = require('./utility-functions')"
    } else {
      return ''
    }
  }

  referenceDeclarations(expression) {
    return this._referenceDeclarationsFromExportedNames(expression)
      .concat(this._referenceDeclarationsFromOutputNames(expression))
  }

  _referenceDeclarationsFromOutputNames(expression) {
    return this._references(expression)
      .filter(ref => this.outputNames.indexOf(ref) !== -1)
      .map(ref => `const ${ref} = payload.${ref}`)
  }

  _referenceDeclarationsFromExportedNames(expression) {
    return this._references(expression)
      .filter(ref => this.exportedNames.indexOf(ref) !== -1)
      .map(ref => `const ${ref} = $utils.${ref}`)
  }

  _references(expression) {
    try {
      return new CodeReferenceIdentifier(expression).externalReferences()
    } catch (e) {
      return []
    }
  }
}

module.exports = ReferenceManager
