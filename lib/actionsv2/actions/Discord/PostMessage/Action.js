const OAuth2ActionBase = require('../../../base/OAuth2ActionBase')

class PostMessageAction extends OAuth2ActionBase {
  get credentialName() {
    return 'discord'
  }

  async perform() {
    const res = await this.fetchWithAuth(
      `https://discord.com/api/v9/channels/${this._channel_id()}/messages`,
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(this.inputValue.message)
      }
    )

    this.setHTTPResponseOutput(res, await res.json())

    return true
  }

  _channel_id() {
    if (this.inputValue.channel_id) {
      return this.inputValue.channel_id
    }
    const id = ((this.codeGrant || {}).guild || {}).system_channel_id
    if (! id) {
      throw new Error('Channel id was not specified')
    }
    return id
  }

  bearerAuthorization() {
    return `Bot ${this.config.discord.bot_token}`
  }
}

module.exports = PostMessageAction
