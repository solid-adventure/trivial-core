class InitializerGenerator {
  constructor(instantiated, featureSettings) {
    this.instantiated = instantiated || []
    this.featureSettings = featureSettings
    this.uniqueActions = Object.values(
      Object.fromEntries(
        this.instantiated.map(gen => [gen.className, gen])
      )
    )
  }

  _indent(value, pad) {
    return value.split("\n").join(`\n${pad}`)
  }

  _addFeatureSettings() {
    if (this.featureSettings && Object.keys(this.featureSettings).length > 0) {
      const settings = this._indent(JSON.stringify(this.featureSettings, null, 2), '  ')
      return `FeatureManager.init(${settings})`
    } else {
      return ''
    }
  }

  _addRequires() {
    return this.uniqueActions.map(gen => gen.requireExpression()).join("\n  ")
  }

  _addRedactions() {
    return this.uniqueActions.map(gen => {
      return `Redactions.addActionPaths(${gen.className})`
    }).join("\n  ")
  }

  definition() {
    let def = `
const Redactions = require('./lib/Redactions')
const FeatureManager = require('./lib/FeatureManager')

module.exports = function() {
  ${this._addFeatureSettings()}

  ${this._addRequires()}

  ${this._addRedactions()}
}
`
    return def
  }
}

module.exports = InitializerGenerator
