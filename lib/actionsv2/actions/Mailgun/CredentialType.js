const CredentialTypeBase = require('../../base/CredentialTypeBase')

class MailgunCredentials extends CredentialTypeBase {
    getConfigFields() {
        return {
            api_key:{type: String, required: true, secret: true},
            domain:{type: String, required: true}
        }
    }
}
module.exports = MailgunCredentials 