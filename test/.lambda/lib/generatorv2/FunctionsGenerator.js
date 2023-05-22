const { sanitizedIdentifier } = require('../../lib/code-utils')

class FunctionsGenerator {
  constructor(defs) {
    this.defs = defs
  }

  _isBlank(value) {
    return /^\s*$/.test(value || '')
  }

  _comment(fn) {
    if (this._isBlank(fn.notes)) {
      return ''
    } else {
      const formatted = fn.notes.replace(/\*\//g, '* /').replace(/\n/g, "\n * ")
      return "/**\n" +
        ` * ${formatted}\n` +
        " */\n"
    }
  }

  _blockBody(fn) {
    return this._comment(fn) +
      fn.definition +
      "\n;"
  }

  _definitions() {
    return this.defs
      .map(fn => this._blockBody(fn))
      .join("\n\n\n")
  }

  _exportNames() {
    return this.defs
      .filter(fn => ! this._isBlank(fn.name))
      .map(fn => sanitizedIdentifier(fn.name))
  }

  _exports() {
    const names = this._exportNames()
    if (names.length > 0) {
      return `module.exports = {\n  ${names.join(",\n  ")}\n}`
    } else {
      return ''
    }
  }

  definition() {
    let def =
`
${this._definitions()}

${this._exports()}
`
    return def
  }
}

module.exports = FunctionsGenerator
