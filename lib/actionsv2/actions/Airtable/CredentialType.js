const CredentialTypeBase = require('../../base/CredentialTypeBase')

class AirtableCredentials extends CredentialTypeBase {
    getConfigFields() {
        return {
          api_key:{type: String, required: true, secret: true},
          base_id:{type: String, required: true},
          table_name:{type: String, required: true}
        }
    }
}
module.exports = AirtableCredentials