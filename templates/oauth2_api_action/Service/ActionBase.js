const OAuth2ActionBase = require('../../base/OAuth2ActionBase')

class ActionBase extends OAuth2ActionBase {
  get refreshEnabled() {
    return true;
  }

  get credentialName() {
    return '{{service}}'
  }

  protocolHelper() {
    return require('../../catalog/ActionProtocols').forType('{{Service}}')
  }


}

module.exports = ActionBase
