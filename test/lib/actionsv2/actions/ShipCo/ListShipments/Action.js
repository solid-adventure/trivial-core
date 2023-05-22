const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const match = sinon.match;
chai.use(require("sinon-chai"));

const ActionInput = require('../../../../../../lib/actionsv2/ActionInput');
const ListShipments = require('../../../../../../lib/actionsv2/actions/ShipCo/ListShipments/Action');

describe("Ship&Co/ListShipments", () => {
  describe(".perform", () => {
    let api_token =
      "jhabvadsjfbhwCBHIAUDYBVUYBXCJBibvsivbiBCYWEABDvybvu_BCbcyudbveryBISBVbywj3DSUNgsi08zho";
    let config = { shipco: {
      api_token 
    }};
    let page = "1";
    let payload = { page };
    let url_encoded_params = new URLSearchParams();
    for (let [key, value] of Object.entries(payload)) {
      url_encoded_params.append(`${key}`, `${value}`);
    }
    let input = new ActionInput({ config, values: { payload } });
    let action = new ListShipments(input);
    action.fetch = fetchStub();

    before(async () => await action.perform());

    it("calls the jobs endpoint", () => {
      expect(action.fetch).to.have.been.calledOnceWith(
        `https://app.shipandco.com/api/v1/shipments?${url_encoded_params.toString()}`
      );
    });

    it("performs a get", () => {
      expect(action.fetch).to.have.been.calledOnceWith(
        match.string,
        match({ method: "GET" })
      );
    });

    it("authorizes with the api token", () => {
      expect(action.fetch).to.have.been.calledOnceWith(
        match.string,
        match({
          headers: match({ "x-access-token": `${config.shipco.api_token}` }),
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
    json: sinon.stub().resolves(data),
  };
  return sinon.stub().resolves(response);
}
