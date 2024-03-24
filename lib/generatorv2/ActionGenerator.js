class ActionGenerator {
  constructor(actionName, actionDef, factory) {
    this.name = actionName
    this.actionDef = actionDef
    this.factory = factory
  }

  get childDefinitions() {
    return (this.actionDef.definition || {}).actions || []
  }

  get generators() {
    return this._generators = this._generators ||
      this.childDefinitions.filter(def => def.enabled).map(def => this.factory.generatorFor(def))
  }

  get _requireString() {
    return JSON.stringify(`./${this.name}`)
  }

  requireExpression() {
    return `const ${this.name} = tryRequire(${this._requireString})`
  }

  invokeExpression() {
    return `const action = new ${this.name}(input)\n` +
      `const output = await action.invoke()`
  }

  wrapInvoke(str) {
    return `if (${this.name}) {\n` +
      `  ${str.split("\n").join("\n  ")}\n` +
      `} else {\n` +
      `  throw lastLoadErrorFor(${this._requireString})\n` +
      `}`
  }

  _unique(values) {
    return [...new Set(values).values()]
  }

  _additionalRequires() {
    return this._unique(this.generators.map(g => g.requireExpression())).join("\n")
  }

  _additionalParams(_params) {
    if (_params == {} || !_params) { return ''}
    let out = ``
    for (let key of Object.keys(_params)) {
      out += `{${key}: ${_params[key]}`
    }
    out += `}`
    return out
  }

  _additionalParamReferences(context) {
    let out = this.factory.contextManager
      ._referenceDeclarations(context)
      .map(ref => `  ${ref}\n`)
      .join('')
    return out
  }

  _checkConditionGuard() {
    if (!this.definedCheckCondition) { return ''}
    return `\n    if (!this.checkCondition()) { return true }\n`
  }

  get definedCheckCondition() {
    try {
      // actions[0] is the transform, actions[1] is the action itself
      return this.actionDef.definition.actions[1].definition.condition
    } catch (e) {
      return false
    }
  }

  _perform(generators, additionalParams) {
    let _params = this._additionalParams(additionalParams)
    return generators.map((g, idx) => {
      if (idx === 0) {
        return `\nawait this.perform${g.name}(${_params})`
      } else {
        return `if (this.canProceed()) {\n      await this.perform${g.name}(${_params})\n    }`
      }
    }).join("\n\n    ")
  }

  _performActions() {
    return this._perform(this.generators)
  }

  _actionMethods() {
    return this.generators.map(g => {
      const configData = g.actionDef.config || {}
      const config = JSON.stringify(configData, null, 2)
      const inputName = JSON.stringify(g.actionDef.inputName || 'payload')
      const outputName = JSON.stringify(g.actionDef.outputName || 'payload')
      const methodBody =
        `const input = await this.nextInput(${config}, ${inputName}, ${outputName}, additionalParams, '${g.name}')\n` +
        // `this.logEvent('[${g.name}] input add params', true, {values: input.values})\n` +
        `${g.invokeExpression()}\n` +
        `this.setLastOutput(output)`

      return `\n  async perform${g.name}(additionalParams) {\n` +
      `    ${g.wrapInvoke(methodBody).split("\n").join("\n    ")}\n` +
      `  }`
    }).join("\n")
  }

  _checkConditionMethod() {
    return `checkCondition() {\n` +
      "    const payload = Object.assign({}, this.values, this.inputValue)\n" +
      "    const initialPayload = payload.initialPayload\n" +
      `    ${this.factory.referenceManager.referenceDeclarations(this.definedCheckCondition)}\n` + // const customFunction() = $utils.customFunction()
      `    return ${this.definedCheckCondition}\n` +
      '  }'
  }

  _additionalDefinitions() {
    return ''
  }

  definition() {
    let def =
`
const { tryRequire, lastLoadErrorFor } = require('./utils')
const ActionBase = require('./lib/actionsv2/base/ActionBase')
${this._additionalRequires()}

class ${this.name} extends ActionBase {
  async perform() {
    ${this._checkConditionGuard()}
    ${this._performActions()}
    return this.canProceed()
  }

  ${this._checkConditionMethod()}
${this._actionMethods()}

}

${this._additionalDefinitions()}

module.exports = ${this.name}
`

    return def
  }
}

module.exports = ActionGenerator
