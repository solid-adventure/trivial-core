const ActionDescriptors = require('./ActionDescriptors')

class ActionCatalog {
  static get all() {
    return this._all = this._all ||
      this._descriptorNames(ActionDescriptors.descriptorClasses)
      .sort()
  }

  static get allUserSearchable() {
    return this._allUserSearchable = this._allUserSearchable ||
      this._descriptorNames(
        ActionDescriptors.descriptorClasses,
        (name, def) => def.isUserSearchable
      )
      .sort()
  }

  static _descriptorNames(dictionary, filterFn) {
    return [...Object.entries(dictionary)]
      .filter(entry => {
        if (filterFn && 'function' === typeof entry[1]) {
          return filterFn(...entry)
        } else {
          return true
        }
      })
      .flatMap(entry => {
        const [name, def] = entry
        if ('function' === typeof def) {
          return name
        } else {
          return this._descriptorNames(def).map(listing => `${name}/${listing}`)
        }
      })
  }
}

module.exports = ActionCatalog
