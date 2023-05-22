const CredentialTypeBase = require('../../base/CredentialTypeBase')

class MySQLCredentials extends CredentialTypeBase {

    // Fields listed here will be manged by the Credentials Vault
    getConfigFields() {
        return {
          host:{type: String, required: true, secret: false},
          port:{type: Number, required: true, default: 3306, secret: false},
          database:{type: String, required: true, secret: false},
          user:{type: String, required: true, secret: false},
          password:{type: String, required: true, secret: true}
        }
    }
}
module.exports = MySQLCredentials

