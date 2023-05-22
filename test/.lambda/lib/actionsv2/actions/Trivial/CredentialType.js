const CredentialTypeBase = require('../../base/CredentialTypeBase')

class TrivialCredentials extends CredentialTypeBase {

    // Fields listed here will be manged by the Credentials Vault
    getConfigFields() {
        return {}
    }
}
module.exports = TrivialCredentials

