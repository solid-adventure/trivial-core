const ActionGenerator = require('./ActionGenerator')

class CollectGenerator extends ActionGenerator {

  _additionalRequires() {
    const base = super._additionalRequires()
    if (this.factory.referenceManager.hasRequireStatements()) {
      return [base, this.factory.referenceManager.requireStatements()].join('\n')
    } else {
      return base
    }
  }


  _additionalParamReferences(context) {
    let out = this.factory.contextManager
      ._referenceDeclarations(context)
      .map(ref => `  ${ref}\n`)
      .join('')
    return out
  }

  _performActions() {
    return `    this.setOutputValue(this.callCustom())`            
  }

  _additionalDefinitions() {
    let def = this.actionDef.definition
    let forRefs = `() => { ${def.code}}`
    return  `${this.name}.prototype.callCustom = function() {\n` +
            `  const payload = Object.assign({}, this.values, this.inputValue)\n` +
            `  const initialPayload = payload.initialPayload\n` +
            `  const additionalParams = payload.additionalParams\n  ` +
            this._externalReferences(forRefs) + 
            this._additionalParamReferences(this.name) +
            `  ${def.code}` +
            `}`
  }

  _externalReferences(expression) {
    return this.factory.referenceManager
      .referenceDeclarations(expression)
      .map(ref => `  ${ref}\n`)
      .join('')
  }


}

module.exports = CollectGenerator
