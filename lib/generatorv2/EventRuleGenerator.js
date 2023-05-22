const ActionGenerator = require('./ActionGenerator')

class EventRuleGenerator extends ActionGenerator {
  get thenDefinitions() {
    return (this.actionDef.definition || {}).then || []
  }

  get thenGenerators() {
    return this._thenGenerators = this._thenGenerators ||
      this.thenDefinitions.filter(def => def.enabled).map(def => this.factory.generatorFor(def))
  }

  get generators() {
    return this._generators = this._generators ||
      this.thenGenerators
  }

  _additionalRequires() {
    const base = super._additionalRequires()
    if (this.factory.referenceManager.hasRequireStatements()) {
      return [base, this.factory.referenceManager.requireStatements()].join('\n')
    } else {
      return base
    }
  }

  _performActions() {
    const thenBlock = this._perform(this.thenGenerators)

    let code = `if (this.checkCondition()) {\n` +
           `      ${thenBlock.split("\n").join("\n  ")}\n` +
           `    }`
    return code
  }

  _externalReferences(expression) {
    return this.factory.referenceManager
      .referenceDeclarations(expression)
      .map(ref => `  ${ref}\n`)
      .join('')
  }


  _additionalDefinitions() {
    return `${this.name}.prototype.checkCondition = function() {\n` +
      "  const payload = Object.assign({}, this.values, this.inputValue)\n" +
      "  let additionalParams = Object.assign({}, this.values.additionalParams)\n" +
      this._externalReferences(this.actionDef.definition.condition) +
      "  with (payload) {\n" +
      `    ${this._additionalParamReferences(this.name)}\n` +
      `    return ( ${this.actionDef.definition.condition} )\n` +
      "  }\n" +
      '}'
  }
}

module.exports = EventRuleGenerator
