class ActionPath {
  constructor(path) {
    this.type = null
    this.name = null
    this.id = null
    this.protocolName = null
    this.innerType = null
    this.innerName = null
    this.innerId = null

    if (path) {
      this._parse(path)
    }
  }

  get path() {
    if (this.innerType) {
      return `${this.type}/${this.name}/${this.id}/${this.innerType}/${this.innerName}/${this.innerId}`
    } else {
      return `${this.type}/${this.name}/${this.id}`
    }
  }

  _parse(path) {
    const parts = String(path ||'').split('/')

    if ('action' === parts[0]) {
      let rest = parts.slice(1)
      let innerTypeIdx = -1

      if ( rest.length >= 5
          && (innerTypeIdx = rest.lastIndexOf('credentials')) >= 2 ) {
        if (innerTypeIdx <= rest.length - 3
            && this._isActionId(rest[innerTypeIdx - 1])
            && rest.slice(0, innerTypeIdx - 1).every(p => this._isIdentifier(p))
            && rest.slice(innerTypeIdx + 1, -1).every(p => this._isIdentifier(p))
            && this._isUuid(rest[rest.length - 1]) ) {
          this.type = 'action'
          this.name = rest.slice(0, innerTypeIdx - 1).join('/')
          this.id = rest[innerTypeIdx - 1]
          this.innerType = 'credentials'
          this.innerName = rest.slice(innerTypeIdx + 1, -1).join('/')
          this.innerId = rest[rest.length - 1]
          this.protocolName = this.innerName
          return true
        }
      }

      if ( rest.length >= 2
          && this._isActionId(rest[rest.length - 1])
          && rest.slice(0, -1).every(p => this._isIdentifier(p)) ) {
        this.type = 'action'
        this.name = rest.slice(0, -1).join('/')
        this.id = rest[rest.length - 1]
        this.protocolName = this.name
        return true
      }
    }

    if ('vault' === parts[0]) {
      let rest = parts.slice(1)
      if ( rest.length >= 2
          && this._isUuid(rest[rest.length - 1])
          && rest.slice(0, -1).every(p => this._isIdentifier(p)) ) {
        this.type = 'vault'
        this.name = rest.slice(0, -1).join('/')
        this.id = rest[rest.length - 1]
        this.protocolName = this.name
        return true
      }
    }
    throw new Error('Invalid action path')
  }

  _isActionId(value) {
    return /^[0-9a-z]+$/.test(value)
  }

  _isUuid(value) {
    return /^[0-9a-f-]+$/.test(value)
  }

  _isIdentifier(value) {
    return /^(?:[_$]|\p{L})(?:[_$\u200c\u200d]|\p{L}|\p{Mn}|\p{Nd}|\p{Pc})*$/u.test(value)
  }
}

module.exports = ActionPath
