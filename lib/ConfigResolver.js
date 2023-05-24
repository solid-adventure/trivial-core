// Resolves action configuration to a set of final values (i.e. de-references references within them)
class ConfigResolver {
  constructor(credentials) {
    this.credentials = credentials
  }

  // tests a single configuration value to see if it is a credential reference
  isCredentialRef(val) {
    return val && val.hasOwnProperty('$ref')
  }

  // returns the credential value for a given reference
  credentialValue(ref) {
    return this.credentials[ref.$ref[0]][ref.$ref[1]]
  }

  // returns the resolved value of a single configuration value
  valueOf(val) {
    return this.isCredentialRef(val) ? this.credentialValue(val) : val
  }

  // returns the resolved dictionary for an entire configuration object
  resolve(config) {
    return Object.fromEntries(
      [...Object.entries(config)].map(entry => {
        const [key, value] = entry
        return [key, this.valueOf(value)]
      })
    )
  }

  // set the credential value at a given reference
  setCredentialValue(ref, value) {
    return this.credentials[ref.$ref[0]][ref.$ref[1]] = value
  }

  // set the value for key on config. if the existing value is a reference, sets the credential value it refers to
  setValue(config, key, value) {
    if (this.isCredentialRef(config[key])) {
      return this.setCredentialValue(config[key], value)
    } else {
      return config[key] = value
    }
  }
}

module.exports = ConfigResolver
