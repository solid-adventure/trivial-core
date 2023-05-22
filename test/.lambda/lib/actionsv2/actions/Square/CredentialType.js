const OAuth2CredentialTypeBase = require('../../base/OAuth2CredentialTypeBase')

class SquareCredentials extends OAuth2CredentialTypeBase {
  get refreshEnabled() {
    return true
  }

  // Fields listed here will be managed by the Credentials Vault
  getConfigFields() {
    return {
      application_id: {type: String, required: true},
      application_scope: {type: String, required: true, example:"ORDERS_READ EMPLOYEES_READ", help:"See https://developer.squareup.com/docs/oauth-api/square-permissions for more."},
      application_secret: {type: String, required: true, secret: true}
    }
  }

  showAuthorizeAction(config) {
    return config.application_id && config.application_secret
  }
}

module.exports = SquareCredentials

