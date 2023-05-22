const OAuth2CredentialTypeBase = require('../../base/OAuth2CredentialTypeBase')

class DiscordCredentials extends OAuth2CredentialTypeBase {
  getConfigFields() {
    return {
      client_id: {type: String, required: true},
      client_secret: {type: String, required: true, secret: true},
      bot_token: {type: String, required: true, secret: true,
        help: 'You will need to create a Bot User for your app to use this action.'
      }
    }
  }

  showAuthorizeAction(config) {
    return config.client_id && config.client_secret
  }

  authorizeLabel(config) {
    return 'Add to Server...'
  }

  reAuthorizeLabel(config) {
    return 'Add to Another Server...'
  }
}

module.exports = DiscordCredentials
