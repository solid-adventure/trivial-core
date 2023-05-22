
const Redactions = require('./lib/Redactions')
const FeatureManager = require('./lib/FeatureManager')

module.exports = function() {
  

  const SendResponse = require("./lib/actionsv2/actions/SendResponse/Action")
  const HttpRequest = require("./lib/actionsv2/actions/HttpRequest/Action")

  Redactions.addActionPaths(SendResponse)
  Redactions.addActionPaths(HttpRequest)
}
