const CredentialTypeBase = require('../../base/CredentialTypeBase')

class ShipCoCredentials extends CredentialTypeBase {
    getConfigFields() {
        return {
            api_token: {
              type: String,
              required: true,
              secret: true,
              help: "See the bottom of your account settings.",
            },
        };
    }
}
module.exports = ShipCoCredentials