class TransformGenerator {
  constructor(actionName, actionDef, factory) {
    this.name = actionName
    this.actionDef = actionDef
    this.factory = factory
    this.transformSteps = this._transformMethods()
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

  _additionalRequires() {
    if (this.factory.referenceManager.hasRequireStatements()) {
      return this.factory.referenceManager.requireStatements()
    } else {
      return ''
    }
  }

  _transformMethods() {
    const methodNames = {}

    return ((this.actionDef.definition || {}).transformations || []).map(assign => {
      let base = (assign.to || '').replace(/[^0-9A-Za-z_]+/g, '_')
      let name = base
      let counter = 0
      while (methodNames.hasOwnProperty(name)) {
        name = `${base}${++counter}`
      }
      methodNames[name] = true
      return {name: `_get_${name}_value`, assign}
    })
  }

  _inputTypeName() {
    return (this.actionDef.definition || {}).from || 'GenericObject'
  }

  _outputTypeName() {
    return (this.actionDef.definition || {}).to || 'GenericObject'
  }

  get _sanitizedInputTypeName() {
    return JSON.stringify(this._inputTypeName())
  }

  get _sanitizedOutputTypeName() {
    return JSON.stringify(this._outputTypeName())
  }

  _setupTransformOutput() {
    return "    const loader = new TrivialSchemaLoader()\n" +
      `    const destType = await loader.load(${this._sanitizedOutputTypeName})\n` +
      `    const out = new TypeAssigner(destType, destType.from(${this._sanitizedInputTypeName}, this.inputValue))\n` +
      `    const identifier = ${this.actionDef.identifier} `
  }

  _callTransformMethod(info) {
    const assignTo = JSON.stringify(info.assign.to)
    return `    out.assign(${assignTo}, this.${info.name}(this.inputValue))`
  }

  _callTransformMethods() {
    return (this.transformSteps || []).map(step => {
      return this._callTransformMethod(step)
    }).join("\n")
  }

  _assignFromRValue(info) {
    if (/^\s*$/.test(String(info.assign.from || ''))) {
      return 'undefined'
    } else {
      return info.assign.from
    }
  }

  _externalReferences(expression) {
    return this.factory.referenceManager
      .referenceDeclarations(expression)
      .map(ref => `  ${ref}\n`)
      .join('')
  }

  _additionalParamReferences(context) {
    let out = this.factory.contextManager
      ._referenceDeclarations(context)
      .map(ref => `  ${ref}\n`)
      .join('')
    return out
  }

  _defineTransformMethod(info) {
    let out = ``
    out += `${this.name}.prototype.${info.name} = function(payload) {\n`
    out += `  payload = Object.assign({}, this.values, payload)\n` // TODO: Do we drop the additional params from this?
    out += `  let additionalParams = Object.assign({}, this.values.additionalParams)\n`
    out += this._externalReferences(info.assign.from)
    out += this._additionalParamReferences(this.name)
    out +=`  with (payload) {\n`
    out +=`    return ( ${this._assignFromRValue(info)} )\n`
    out +=`  }\n`
    out +='}'
    return out
  }

  _defineTransformMethods() {
    return (this.transformSteps || []).map(step => {
      return this._defineTransformMethod(step)
    }).join("\n\n")
  }

  definition() {
    let def =
`
const { tryRequire, lastLoadErrorFor } = require('./utils')
const ActionBase = require('./lib/actionsv2/base/ActionBase')
const { TrivialSchemaLoader } = require('./lib/TrivialSchemas')
const { TypeAssigner } = require('./lib/Trivial/TypeAssigner')
${this._additionalRequires()}

class ${this.name} extends ActionBase {
  async perform() {
${this._setupTransformOutput()}
${this._callTransformMethods()}
    this.logEvent('Transform', true, {input: {${this._sanitizedInputTypeName} : this.inputValue}, output: {${this._sanitizedOutputTypeName}: out.dest}}, identifier)
    this.setOutputValue(out.dest)
    return true
  }
}

${this._defineTransformMethods()}

module.exports = ${this.name}
`

    return def
  }
}

module.exports = TransformGenerator
