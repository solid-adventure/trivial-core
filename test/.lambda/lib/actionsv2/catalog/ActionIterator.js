const ActionDescriptors = require('./ActionDescriptors')

class ActionIterator {
  constructor(def) {
    this.current = def
  }

  // returns an array of action definition arrays
  get innerActionCollections() {
    const desc = ActionDescriptors.forType(this.current.type)
    return (desc.actionSlots || []).map(slotName => {
      return (this.current.definition || {})[slotName] || []
    })
  }

  // returns an array of entries where the first member is a name and the second is an arry of action definitions
  get innerActionEntries() {
    const desc = ActionDescriptors.forType(this.current.type)
    return (desc.actionSlots || []).map(slotName => {
      return [slotName, (this.current.definition || {})[slotName] || []]
    })
  }

  // returns an array of user-visible entries where the first member is a name and the second is an arry of action definitions
  get visibleInnerActionEntries() {
    const desc = ActionDescriptors.forType(this.current.type)
    if (desc.contentsUserVisible) {
      return (desc.actionSlots || []).map(slotName => {
        return [slotName, (this.current.definition || {})[slotName] || []]
      })
    } else {
      return []
    }
  }

  visitAll(fn) {
    this._visitDepthFirst((...args) => {
      fn(...args)
      return true
    }, 0, [])
  }

  find(fn) {
    let found = undefined

    this._visitDepthFirst((item, ...args) => {
      if (fn(item, ...args)) {
        found = item
        return false
      }
      return true
    }, 0, [])

    return found
  }

  maxIdentifier() {
    let maxId = 0
    this.visitAll(def => {
      let id = parseInt(def.identifier)
      maxId = id > maxId ? id : maxId
    })
    return maxId
  }

  // visits only immediate children without recursing into their children
  eachChild(fn) {
    this.innerActionCollections.forEach(collection => {
      collection.forEach((child, idx) => {
        fn(child, idx, this.current)
      })
    })
  }

  _visitDepthFirst(fn, idx, parents) {
    if (!fn(this.current, idx, parents)) {
      return
    }
    this.innerActionCollections.forEach(collection => {
      collection.forEach((def, idx) => {
        parents.push(this.current)
        this.current = def
        this._visitDepthFirst(fn, idx, parents)
        this.current = parents.pop()
      })
    })
  }
}
module.exports = ActionIterator
