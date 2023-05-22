const CredentialTypeBase = require('../../base/CredentialTypeBase')

class SquarespaceCredentials extends CredentialTypeBase {

    // Fields listed here will be manged by the Credentials Vault
    getConfigFields() {
        return {
          api_key:{type: String, required: true, secret: true}
        }
    }
}
module.exports = SquarespaceCredentials

