const CredentialTypeBase = require('../../base/CredentialTypeBase')

class PostgreSQLCredentials extends CredentialTypeBase {
    getConfigFields() {
        return {
          host:{type: String, required: true, secret: false},
          port:{type: Number, required: true, secret: false},
          database:{type: String, required: true, secret: false},
          user:{type: String, required: true, secret: false},
          password:{type: String, required: true, secret: true}
        }
    }
}
module.exports = PostgreSQLCredentials