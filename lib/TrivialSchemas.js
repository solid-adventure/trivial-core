const TrivialSchemas = require('./models-dynamic/TrivialSchemas')

module.exports.TrivialSchemas = TrivialSchemas


class TrivialSchemaLoader {
  async nameSearch(term) {
    const searchStr = String(term || '').toUpperCase()
    return Promise.resolve(
      Object.keys(TrivialSchemas)
      .filter(schema => schema.toUpperCase().indexOf(searchStr) !== -1)
    )
  }

  async load(name) {
    return Promise.resolve(TrivialSchemas[name])
  }
}

module.exports.TrivialSchemaLoader = TrivialSchemaLoader
