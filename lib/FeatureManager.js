class FeatureManager {
  static init(settings) {
    this._settings = Object.fromEntries(
      [...Object.entries(settings)]
        .map(entry => [this.featureKey(entry[0]), entry[1]])
    )
  }

  static isEnabled(name) {
    // permits: const { isEnabled } = require('./FeatureManager')
    const self = this || FeatureManager

    if ('undefined' !== typeof window) {
      if (self._enabledBrowserFeatures[self.featureKey(name)]) {
        return true
      }
    }

    if (self._featureHasSetting(name)) {
      return self._featureSetting(name)
    }

    if ('undefined' !== typeof process) {
      if (process.env && process.env[`ENABLE_${self.featureKey(name).toUpperCase()}`]) {
        return true
      }
    }

    return false
  }

  static requestSettings(req) {
    return Object.assign(
      {},
      this._envToFeatureMap(),
      this._resolvedSettings(),
      this._enableListToFeatureMap(req.query.enableFeatures)
    )
  }

  static envSettings() {
    return Object.assign(
      {},
      this._envToFeatureMap(),
      this._resolvedSettings()
    )
  }

  static featureParams() {
    // permits: const { featureParams } = require('./FeatureManager')
    const self = this || FeatureManager

    if ('undefined' !== typeof window) {
      const enabled = Object.keys(self._enabledBrowserFeatures).join(',')
      return enabled ? `enableFeatures=${encodeURIComponent(enabled)}` : ''
    }

    return ''
  }

  static featureKey(value) {
    let result = String(value || '').replace(/([A-Z]+)([A-Z][[a-z])/g, '$1_$2')
    result = result.replace(/([a-z\d])([A-Z])/g, '$1_$2')
    result = result.replace(/[-\s]+/g, '_')
    return result.toLowerCase()
  }

  static _featureHasSetting(name) {
    return this.featureKey(name) in (this._settings || {})
  }

  static _featureSetting(name) {
    const setting = (this._settings || {})[this.featureKey(name)]
    return this._resolveSetting(setting)
  }

  static _resolveSetting(setting) {
    return 'function' === typeof setting ? setting() : setting
  }

  static get _enabledBrowserFeatures() {
    if (! this._enabledBrowserFeaturesCache) {
      if (window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        this._enabledBrowserFeaturesCache =
          this._enableListToFeatureMap(params.get('enableFeatures'))
      }
    }

    return this._enabledBrowserFeaturesCache || {}
  }

  static _enableListToFeatureMap(enable) {
    return Object.fromEntries(
      (enable || '').split(/,/).map(feature => {
        return [this.featureKey(feature.trim()), true]
      })
    )
  }

  static _envToFeatureMap() {
    return Object.fromEntries(
      [...Object.entries(process.env)]
        .filter(entry => entry[0].substring(0, 7) === 'ENABLE_' && entry[1])
        .map(entry => [this.featureKey(entry[0].substring(7, entry[0].length)), true])
    )
  }

  static _resolvedSettings() {
    return Object.fromEntries(
      [...Object.entries(this._settings || {})]
        .map(entry => {
          return [entry[0], this._resolveSetting(entry[1])]
        })
    )
  }
}

module.exports = FeatureManager

if ('undefined' !== typeof featureManagerInit) {
  FeatureManager.init(featureManagerInit)
}
