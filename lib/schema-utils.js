
module.exports.RequiredString = { type: String, required: true }
module.exports.RequiredNumber = { type: Number, required: true }
module.exports.RequiredBoolean = { type: Boolean, required: true }
module.exports.OptionalString = { type: String, required: false }
module.exports.OptionalNumber = { type: Number, required: false }
module.exports.OptionalBoolean = { type: Boolean, required: false }

function schema(def) {
  let cast

  if (def.cast) {
    cast = def.cast
    delete def.cast
  } else {
    cast = function(val) { return arguments.length === 0 ? {} : val }
  }

  cast.from = function(typeName, input) {
    const conversion = cast[`from${typeName}`]
    if ('function' === typeof conversion) {
      return conversion.call(cast, input)
    } else {
      return cast({})
    }
  }

  Object.assign(cast, def)

  return cast
}
module.exports.schema = schema


function arrayOf(type, def) {
  let result = schema(Object.assign({
    cast(val) {
      if (Array.isArray(val)) {
        return val
      } else if (null === val || undefined === val) {
        return []
      } else {
        return [val]
      }
    }
  }, def))

  result.member_type = type

  return result
}
module.exports.arrayOf = arrayOf

function defaultTransformations(forType, prefix = '') {
  let transforms = []

  Object.keys(forType.fields || {}).forEach(fieldName => {
    let field = forType.fields[fieldName]
    if (field.required) {
      transforms.push([String(field.example || ''), `${prefix}${fieldName}`])
    }
    if (field.type.fields) {
      transforms =
        transforms.concat(defaultTransformations(field.type, `${prefix}${fieldName}.`))
    }
  })

  return transforms
}
module.exports.defaultTransformations = defaultTransformations

function optionalFields(forType, transforms = [], prefix = '') {
  let fields = []

  Object.keys(forType.fields || {}).forEach(fieldName => {
    let field = forType.fields[fieldName]
    const path = `${prefix}${fieldName}`
    if (!field.required && undefined === transforms.find(t => t[1] === path)) {
      fields.push(path)
    }
    if (field.type.fields) {
      fields = fields.concat(optionalFields(field.type, transforms, `${path}.`))
    }
  })

  return fields
}
module.exports.optionalFields = optionalFields

function defaultValueForField(fieldDef) {
  if ('undefined' === typeof fieldDef.default) {
    if ('member_type' in fieldDef.type) {
      return []
    } else {
      return fieldDef.example || null
    }
  } else {
    return fieldDef.default
  }
}
module.exports.defaultValueForField = defaultValueForField

function allFieldsWithDefaults(forType) {
  return Object.fromEntries(
    [...Object.entries(forType.fields || {})].map(entry => {
      const [name, def] = entry
      const value = defaultValueForField(def)
      return [name, value]
    })
  )
}
module.exports.allFieldsWithDefaults = allFieldsWithDefaults
