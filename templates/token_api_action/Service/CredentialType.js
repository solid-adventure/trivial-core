const CredentialTypeBase = require('../../base/CredentialTypeBase')

class {{service}}Credentials extends CredentialTypeBase {
    getConfigFields() {
        return {
          api_key:{type: String, required: true, secret: true},
          another_field:{type: String, required: true},
        }
    }
}
module.exports = {{service}}Credentials

// Fields listed here will be manged by the Credentials Vault


// A reference to this file must be added to source/lib/actionsv2/catalog/CredentialTypes, eg:

// {{service}}Credentials: require('../actions/{{service}}/CredentialType'),
