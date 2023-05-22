class BuiltinActionGenerator {
  constructor(actionName, actionDef, factory) {
    this.name = actionName
    this.actionDef = actionDef
    this.factory = factory
  }

  get className() {
    return this.actionDef.type.replace(/\//g, '_')
  }

  requireExpression() {
    const filePath = this.actionDef.type
    const className = this.className
    return `const ${className} = require(${JSON.stringify(`./lib/actionsv2/actions/${filePath}/Action`)})`
  }

  invokeExpression() {
    return `const action = new ${this.className}(input)\n` +
      `const output = await action.invoke()`
  }

  wrapInvoke(str) {
    return str
  }
}

module.exports = BuiltinActionGenerator
