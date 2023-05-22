class ActionOutput {
  constructor(input) {
    this.input = input
    this.proceed = false
    this._values = {}
  }

  setValue(name, value) {
    this._values[name] = value
  }

  outputValues() {
    return Object.assign({}, this.input.values, this._values)
  }

  assignedEntries() {
    return Object.entries(this._values)
  }
}

module.exports = ActionOutput
