const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const match = sinon.match;
chai.use(require("sinon-chai"));

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput');
const PostMessage = require('../../../../../../lib/actionsv2/actions/Slack/PostMessage/Action');

describe("Slack/PostMessage", () => {
  describe(".perform", () => {
    let config = { slack: {
      webhook_url: "https://hooks.slack.com/services/T0BJ/B027VKW/W6m",
    }};
    let payload = { text: "sample message" };
    let input = new ActionInput({ config, values: { payload } });
    let action = new PostMessage(input);
    action.fetch = fetchStub();

    before(async () => await action.perform());

    it("calls the user-provided webhook endpoint", () => {
      expect(action.fetch).to.have.been.calledOnceWith(
        "https://hooks.slack.com/services/T0BJ/B027VKW/W6m"
      );
    });

    it("performs a post", () => {
      expect(action.fetch).to.have.been.calledOnceWith(
        match.string,
        match({ method: "POST" })
      );
    });

    it("sends the payload as the body", () => {
      expect(action.fetch).to.have.been.calledOnceWith(
        match.string,
        match({
          body: JSON.stringify(payload),
        })
      );
    });
  });
});

function fetchStub(data = {}) {
  let response = {
    ok: true,
    status: 200,
    statusText: "OK",
    text: sinon.stub().resolves(data),
  };
  return sinon.stub().resolves(response);
}
