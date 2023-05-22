const CredentialTypeBase = require('../../base/CredentialTypeBase')

class SlackCredentials extends CredentialTypeBase {
    getConfigFields() {
        return {
            webhook_url: {
              type: String,
              required: true,
              help:
                "Go to 'Incoming Webhooks' section in your App Management page, click on 'Activate Incoming Webhooks', and add a new webhook to your Slack workspace.",
            },
          }
    }
}
module.exports = SlackCredentials