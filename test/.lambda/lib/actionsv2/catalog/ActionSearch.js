const ActionCatalog = require('./ActionCatalog')
const ActionDescriptors = require('./ActionDescriptors')
const { stripTags } = require('../../html-utils')
const lunr = require('lunr')

class ActionSearch {
  static search(query) {
    if (query) {
      return this.index.search(query).map(hit => hit.ref)
    } else {
      return ActionCatalog.allUserSearchable
    }
  }

  static get index() {
    return this._index = this._index || this._rebuildIndex()
  }

  static _rebuildIndex() {
    const verbatimFields = new Set(['type', 'name'])

    function conditionalWordFilter(token, ...args) {
      if (token.metadata.fields.find(f => verbatimFields.has(f)) !== undefined) {
        return token
      } else {
        return lunr.stemmer(token, ...args)
      }
    }

    const builder = new lunr.Builder()

    builder.pipeline.add(
      lunr.trimmer,
      conditionalWordFilter,
      lunr.stemmer
    )

    builder.searchPipeline.add(
      lunr.stemmer
    )

    builder.ref('type')
    builder.field('type')
    builder.field('name')
    builder.field('overview')

    ActionCatalog.allUserSearchable.forEach(name => {
      const descriptor = ActionDescriptors.forType(name)

      builder.add({
        type: name,
        name: descriptor.descriptiveName,
        overview: stripTags(descriptor.overviewHTML)
      })
    })

    return builder.build()
  }
}

module.exports = ActionSearch
