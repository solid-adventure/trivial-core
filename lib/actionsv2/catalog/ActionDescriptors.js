const { allFieldsWithDefaults, defaultTransformations } = require('../../schema-utils')
const FeatureManager = require('../../FeatureManager')
let lastIdentifier = 0
let AVAILABLE_ACTIONS
try {
  AVAILABLE_ACTIONS  = require('../../models-dynamic/AvailableActions')
} catch (e) {
  console.log(`Could not load AvailableActions. You may need to run\n new ActionRegistry().build()`)
}

class ActionDescriptors {
  static forType(typeName) {
    return this._descriptorInstance(typeName) || this._descriptorInstance('Group')
  }

  static _descriptorInstance(name) {
    this._instances = this._instances || {}
    if (! (name in this._instances)) {
      const Descriptor = this._actionAtPath(name)
      if ('function' === typeof Descriptor) {
        this._instances[name] = new Descriptor()
        this._instances[name].name = name
      }
    }
    return this._instances[name]
  }

  static _actionAtPath(name) {
    return String(name)
      .split('/')
      .reduce((obj, key) => {
          return obj ? obj[key] : undefined
      }, this.descriptorClasses)
  }

  static get descriptorClasses() {
    return Object.fromEntries(
      [...Object.entries(AVAILABLE_ACTIONS)]
      // .filter(entry => {
      //   const [name, value] = entry
      //   if (name === 'Google' && ! FeatureManager.isEnabled('GOOGLE_ACTIONS')) {
      //     return false
      //   } else {
      //     return true
      //   }
      // })
    )
  }

  static actionDefinitionAndCredentialsOfType(typeName, identifierValue) {
    const descriptor = this.forType(typeName)
    const configFields = descriptor.configFields || {}
    const credTypes = descriptor.credentialTypes || {}
    const defFields = descriptor.definitionFields || {}
    const slots = descriptor.actionSlots || []
    const creds = []

    const identifier = (identifierValue || ++lastIdentifier).toString()
    const def = {identifier, name: null, inputName: null, outputName: null}
    if (typeName) {
      def.type = typeName
    }
    if (Object.keys(configFields).length > 0) {
      def.config = allFieldsWithDefaults({fields: configFields})
      const fields = [...Object.entries(configFields || {})]
      fields.forEach((field,idx) => {
        const [name, spec] = field
        if (spec.secret) {
          creds.push([idx.toString(), def.config[name]])
          def.config[name] = {$ref: [identifier, idx.toString()]}
        }
      })
    }
    if (Object.keys(credTypes).length > 0) {
      if (! def.config) {
        def.config = {}
      }
      Object.keys(credTypes).forEach(name => {
        def.config[name] = {$cred: null}
      })
    }
    if (slots.length > 0 || Object.keys(defFields).length > 0) {
      def.definition = allFieldsWithDefaults({fields: defFields})
      slots.forEach(name => def.definition[name] = [])
    }

    def.enabled = true

    let action = def
    if (descriptor.embedTransform) {
      action = this.wrapDefinitionWithTransform(def)
    }

    return {
      action,
      credentials: creds.length > 0 ? Object.fromEntries(creds) : null
    }
  }

  static actionDefinitionOfType(typeName, identifierValue) {
    const {action, credentials} =
      this.actionDefinitionAndCredentialsOfType(typeName, identifierValue)
    return action
  }

  static wrapDefinitionWithTransform(def) {
    const startIdentifier = parseInt(def.identifier)
    const wrapper = this.actionDefinitionOfType('ActionWithTransform', startIdentifier)
    const xform = this.actionDefinitionOfType('Transform', startIdentifier + 1)
    def.identifier = (startIdentifier + 2).toString()
    xform.definition.to = this.forType(def.type).expectedTypeName
    this.addDefaultTransformations(xform)
    wrapper.definition.actions.push(xform)
    wrapper.definition.actions.push(def)
    wrapper.name = def.name || this.forType(def.type).name
    return wrapper
  }

  static addDefaultTransformations(transformDef) {
    const schema = require('../../TrivialSchemas').TrivialSchemas[transformDef.definition.to]
    if (schema) {
      defaultTransformations(schema).forEach(pair => {
        transformDef.definition.transformations.push({from: pair[0], to: pair[1]})
      })
    }
  }
}

module.exports = ActionDescriptors
