const { nextPathStep } = require('../code-utils')

class PathNavigator {
  constructor(type) {
    this.type = type
  }

  fieldSpec(fieldName) {
    return this.type.fields ? this.type.fields[fieldName] : undefined
  }

  fieldType(fieldName) {
    const spec = this.fieldSpec(fieldName)
    return spec && spec.type ? spec.type : undefined
  }

  asFieldType(fieldName, value) {
    const type = this.fieldType(fieldName)
    return type ? type(value) : value
  }
}

class TypeAssigner extends PathNavigator {
  constructor(type, dest) {
    super(type)
    this.dest = dest
  }

  assign(path, value) {
    let [name, rest] = nextPathStep(path)
    if (rest) {
      const type = this.fieldType(name) || Object
      if (! this.dest[name]) {
        this.dest[name] = type()
      }
      return new TypeAssigner(type, this.dest[name]).assign(rest, value)
    } else {
      return this.dest[name] = this.asFieldType(name, value)
    }
  }
}

module.exports.TypeAssigner = TypeAssigner


class TypeIdentifier extends PathNavigator {
  specAt(path) {
    let [name, rest] = nextPathStep(path)
    if (rest) {
      const type = this.fieldType(name) || Object
      return new TypeIdentifier(type).specAt(rest)
    } else {
      return this.fieldSpec(name)
    }
  }

  typeAt(path) {
    const spec = this.specAt(path)
    return spec ? spec.type : undefined
  }
}

module.exports.TypeIdentifier = TypeIdentifier
