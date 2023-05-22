const ActionDescriptorBase = require("../../../base/ActionDescriptorBase");

class PostSlackMessageeDescriptor extends ActionDescriptorBase {
  get fullDescriptionHTML() {
    let h = `
    This action posts messages in a Slack channel.  
    <h2>Overview</h2> 
    <p>
      To use this action, you will create a Slack app and install it in your Slack workspace.<br/>
      Then, you will be able to post automated messages to a channel of your choosing.
    </p>
    <h2>You Will Need</h2>
    <ol>
      <li>A <a href="https://api.slack.com/authentication/basics" target="_blank">Slack app</a></li>
      <li>Admin privileges on a Slack workspace</li>
    </ol>
    `;
    return h;
  }

  get iconUrl() {
    return "/assets/images/action-icons/slack.svg";
  }

  get expectedTypeName() {
    return "SlackMessage";
  }

  getCredentialTypes(){
    return {
      slack: {type: 'SlackCredentials', required: true}
    }
  }
}

module.exports = PostSlackMessageeDescriptor;
