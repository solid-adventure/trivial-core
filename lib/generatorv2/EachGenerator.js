const ActionGenerator = require('./ActionGenerator')

class EachGenerator extends ActionGenerator {

  _additionalRequires() {
    const base = super._additionalRequires()
    if (this.factory.referenceManager.hasRequireStatements()) {
      return [base, this.factory.referenceManager.requireStatements()].join('\n')
    } else {
      return base
    }
  }

  _additionalContext() {
    return this.factory.contextManager
      ._referenceDeclarations()
      .map(ref => `  ${ref}\n`)
      .join('')
  }

  setAdditionalContext() {
    for (let g of this.generators) {
      this.factory.contextManager.setContext(g.name, Object.keys(this._additionalParamsForChildren()))
    }
  }

  _additionalParamsForChildren() {
    let out = {}
    out[this.actionDef.definition.item_name] = this.actionDef.definition.item_name
    return out
  }

  _additionalParamReferences(context) {
    let out = this.factory.contextManager
      ._referenceDeclarations(context)
      .map(ref => `  ${ref}\n`)
      .join('')
    return out
  }

  _performActions() {
    this.setAdditionalContext()

    const actionBlock = this._perform(this.generators, this._additionalParamsForChildren())
    let code =  `const payload = Object.assign({}, this.values, this.inputValue)\n` +
                `const initialPayload = payload.initialPayload\n` +
                `const additionalParams = payload.additionalParams\n` +
                this._additionalParamReferences(this.name) +
                this._externalReferences(this.actionDef.definition.list) +
                `for (let ${this.actionDef.definition.item_name} of ${this.actionDef.definition.list}) {` +
           `          ${actionBlock.split("\n").join("\n  ")}\n` +
           `}`
    return code
  }

  _externalReferences(expression) {
    return this.factory.referenceManager
      .referenceDeclarations(expression)
      .map(ref => `  ${ref}\n`)
      .join('')
  }


}

module.exports = EachGenerator
