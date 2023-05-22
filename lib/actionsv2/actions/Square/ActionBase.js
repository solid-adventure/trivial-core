const OAuth2ActionBase = require('../../base/OAuth2ActionBase')

class ActionBase extends OAuth2ActionBase {
  get refreshEnabled() {
    return true;
  }

  get credentialName() {
    return 'Square'
  }

  protocolHelper() {
    return require('../../catalog/ActionProtocols').forType('Square')
  }


}

module.exports = ActionBase
