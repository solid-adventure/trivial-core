const ActionBase = require("../../../base/ActionBase");

class PostSlackMessage extends ActionBase {
  async perform() {
    const res = await this.fetch(`${this.config.slack.webhook_url}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(this.inputValue),
    });

    this.setHTTPResponseOutput(res, await res.text());

    return true;
  }
}

module.exports = PostSlackMessage;
