const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const match = sinon.match;
chai.use(require("sinon-chai"));

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput');
const CreateShipment = require('../../../../../../lib/actionsv2/actions/ShipCo/CreateShipment/Action');

describe("Ship&Co/CreateShipment", () => {
  describe(".perform", () => {
    let api_token = "jhabvadsjfbhwCBHIAUDYBVUYBXCJBibvsivbiBCYWEABDvybvu_BCbcyudbveryBISBVbywj3DSUNgsi08zho"
    let config = { shipco: { api_token} }
    let to_address = { "full_name" : "test" }
    let from_address = { "full_name" : "name" }
    let payload = { to_address, from_address }
    let input = new ActionInput({ config, values: { payload } })
    let action = new CreateShipment(input)
    action.fetch = fetchStub()

    before(async () => await action.perform())

    it("calls the shipments endpoint", () => {
      expect(action.fetch).to.have.been.calledOnceWith(`https://app.shipandco.com/api/v1/shipments`)
    })

    it("performs a post", () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({ method: "POST" }))
    })

    it("authorizes with the api token", () => {
      expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
          headers: match({ "x-access-token": `${config.shipco.api_token}` })
        }))
    })

    it('sends the payload as the body', () => {
        expect(action.fetch).to.have.been.calledOnceWith(match.string, match({
          body: JSON.stringify(payload)
        }))
    })
  })
})

function fetchStub(data = {}) {
  let response = {
    ok: true,
    status: 200,
    statusText: "OK",
    json: sinon.stub().resolves(data),
    text: sinon.stub().resolves(JSON.stringify(data)),
  };
  return sinon.stub().resolves(response);
}
