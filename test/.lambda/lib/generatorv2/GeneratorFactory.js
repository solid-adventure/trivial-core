const ActionIterator = require('../actionsv2/catalog/ActionIterator')
const ActionGenerator = require('./ActionGenerator')
const BuiltinActionGenerator = require('./BuiltinActionGenerator')
const TransformGenerator = require('./TransformGenerator')
const EventRuleGenerator = require('./EventRuleGenerator')
const IfGenerator = require('./IfGenerator')
const CollectGenerator = require('./CollectGenerator')
const CustomGenerator = require('./CustomGenerator')
const EachGenerator = require('./EachGenerator')
const ReferenceManager = require('../ReferenceManager')
const ContextManager = require('../ContextManager')
const { sanitizedIdentifier } = require('../code-utils')
const ActionImplementations = require('../actionsv2/catalog/ActionImplementations')

class GeneratorFactory {
  constructor(manifest) {
    this.manifest = manifest || {}
    this.idToName = {}
    this.nameToGenerator = {}
    this.needsDefinition = []
    this.initializedGenerators = []
    this.referenceManager = new ReferenceManager(this.functionDefinitions, this.outputNames)
    this.contextManager = new ContextManager(this)
  }

  get functionDefinitions() {
    if (!this.manifest) { return [] }
    let library = this.manifest.definitions || []
    return library.filter(l => l.type === 'function')
  }

  get outputNames() {
    let out = []
    new ActionIterator(this.manifest.program || {}).visitAll(def => {out.push(def.outputName)})
    return out.filter(n => n)
  }

  generatorFor(def) {
    if (def.identifier in this.idToName) {
      return this.nameToGenerator[this.idToName[def.identifier]]
    }

    const name = this._uniqueName(def)
    const generator = this._generator(name, def)
    this.idToName[def.identifier] = name
    this.nameToGenerator[name] = generator

    return generator
  }

  nextUndefined() {
    return this.needsDefinition.shift()
  }

  _uniqueName(def) {
    const base = sanitizedIdentifier(this._initialCap(
      def.name || def.type || 'Main'
    ))
    let name = `${base}Action`
    let count = 1

    while (name in this.nameToGenerator) {
      name = `${base}${++count}Action`
    }

    return name
  }

  _inlineGenerator(name, def) {
    switch (def.type) {
    case 'Transform':
      return new TransformGenerator(name, def, this)
    case 'If':
      return new IfGenerator(name, def, this)
    case 'Each':
      return new EachGenerator(name, def, this)
    case 'EventRule':
      return new EventRuleGenerator(name, def, this)
    case 'Collect':
      return new CollectGenerator(name, def, this)
    case 'Custom':
      return new CustomGenerator(name, def, this)
    default:
      return new ActionGenerator(name, def, this)
    }
  }

  _generator(name, def) {
    if (this._isBuiltin(def.type)) {
      const gen = new BuiltinActionGenerator(name, def, this)
      this.initializedGenerators.push(gen)
      return gen
    } else {
      const gen = this._inlineGenerator(name, def)
      this.needsDefinition.push(gen)
      return gen
    }
  }

  _isBuiltin(name) {
    return ActionImplementations.hasImplementation(name)
  }

  _initialCap(str) {
    return String(str || '').replace(/^(.)/, char => char.toUpperCase())
  }
}

module.exports = GeneratorFactory
