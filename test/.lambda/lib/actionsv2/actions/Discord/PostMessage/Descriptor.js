const ActionDescriptorBase = require('../../../base/ActionDescriptorBase')

class PostMessageDescriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {

    let h = `
    This action posts automated messages to Discord.
    <h2>Overview</h2>
    To use this action, you'll make a private application for your Discord server and a Bot🤖 user.
    <br />You'll then be able to send automated messages into a channel of your choice.
    You might use Discord/Post Message as part of a sequence that:
    <ul>
    <li>Welcomes a new user👋</li>
    <li>Responds to chat messages💁</li>
    <li>Makes dreams come true🧞‍♂️</li>
    </ul>
    <h2>You will need</h2>
    <ul>
    <li>Admin privileges on a Discord server</li>
    </ul>
    <h2>Instructions</h2>
    <ol>
      <li><h3>Create an App</h3>
        <ol>
          <li>Go to <a target="_blank" href="http://discord.com/developers/">discord.com/developers</a></li>
          <li>Hit "New Application" or choose existing</li>
          <li>Go to the <strong>Oauth2 -> General</strong> section and copy your <strong>Client ID</strong> and paste into Trivial.</li>
          <li>Repeat for <strong>Client Secret</strong>.</li>
          <li>Still on <strong>Oauth2 -> General</strong> click <strong>Add Redirect</strong> and add <code>${this.oauth2RedirectUrl}</code></li>
        </ol>
      </li>
      <li><h3>Create a Bot</h3>
        <ol>
          <li>Go to <strong>Bot</strong> and click "Add Bot"</li>
          <li>Copy the <strong>Bot token</strong> and paste into Trivial</li>
        </ol>
      </li>
      <li><h3>Add to Server &amp; Test</h3>
        <ol>
          <li>In Trivial, Click 'Add to Server' and follow the instructions to Authorize</li>
          <li>Click Save &amp; Rebuild</li>
          <li>Test your app, a message should be posted to Discord.🏄‍♀️</li>
        </ol>
      </li>
    </ol>
    `
    return h
 }

  get iconUrl() {
    return '/assets/images/action-icons/discord.svg'
  }

  get expectedTypeName() {
    return 'DiscordChannelMessage'
  }

  getCredentialTypes() {
    return {
      'discord': {type: 'DiscordCredentials', required: true}
    }
  }

  afterAdd({transform}) {
    transform.definition.transformations.push({
      from: '"example message"', to: 'message.content'
    })
  }
}

module.exports = PostMessageDescriptor
