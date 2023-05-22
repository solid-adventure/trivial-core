const CredentialTypeBase = require('../../base/CredentialTypeBase')

class ArkaCredentials extends CredentialTypeBase {
  getConfigFields() {
    return {
      api_key: { type: String, required: true, secret: true },
    }
  }
}

module.exports = ArkaCredentials
