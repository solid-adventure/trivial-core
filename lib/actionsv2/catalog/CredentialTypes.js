const { allFieldsWithDefaults } = require('../../schema-utils')

let AvailableTypes
let AVAILABLE_TYPES
try {
  AvailableTypes  = require('../../models-dynamic/AvailableCredentialsTypes')
  AVAILABLE_TYPES = AvailableTypes.AVAILABLE_TYPES
} catch (e) {
  console.log(`Could not load AvailableCredentialsTypes. You may need to run\n new ActionRegistry().build()`)
}

class CredentialTypes {
  static allTypes() {
    return this._types = this._types || Object.keys(AVAILABLE_TYPES).sort()
  }

  static forType(typeName) {
    return this._typeInstance(typeName)
  }

  static _typeInstance(name) {
    this._instances = this._instances || {}
    if (! (name in this._instances)) {
      const TypeClass = this.typeClasses[name]
      if ('function' === typeof TypeClass) {
        this._instances[name] = new TypeClass()
        this._instances[name].name = name
      }
    }
    return this._instances[name]
  }

  static get typeClasses() {
    return AVAILABLE_TYPES
  }

  static credentialsOfType(typeName) {
    const typeInst = this.forType(typeName)
    const configFields = typeInst.configFields || {}
    return allFieldsWithDefaults({fields: configFields})
  }
}

module.exports = CredentialTypes
