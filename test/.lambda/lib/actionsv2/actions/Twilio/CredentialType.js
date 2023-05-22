const CredentialTypeBase = require('../../base/CredentialTypeBase')

class TwilioCredentials extends CredentialTypeBase {
  getConfigFields() {
    return {
      account_sid:{type: String, required: true, secret: true},
      auth_token:{type: String, required: true, secret: true}
    }
  }
}

module.exports = TwilioCredentials
