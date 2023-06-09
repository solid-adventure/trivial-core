const OAuth2CredentialTypeBase = require('../../base/OAuth2CredentialTypeBase')

class {{Service}}Credentials extends OAuth2CredentialTypeBase {
  get refreshEnabled() {
    return true
  }

// Fields listed here will be managed by the Credentials Vault
  getConfigFields() {
    return {
      client_id: {type: String, required: true},
      client_secret: {type: String, required: true, secret: true}
    }
  }

  showAuthorizeAction(config) {
    return config.client_id && config.client_secret
  }
}

// This name must match the reference in the actions Descriptor.js
module.exports = {{Service}}Credentials



// A reference to this file must be added to source/lib/actionsv2/catalog/CredentialTypes, eg:
// {{service}}Credentials: require('../actions/{{service}}/CredentialType'),
