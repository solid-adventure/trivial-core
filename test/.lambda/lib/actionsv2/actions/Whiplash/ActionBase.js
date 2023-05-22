const OAuth2ActionBase = require('../../base/OAuth2ActionBase')

class ActionBase extends OAuth2ActionBase {

  get baseURL() {
    return 'https://www.getwhiplash.com/api/v2'
  }

  get refreshEnabled() {
    return true;
  }

  get credentialName() {
    return 'whiplash'
  }

  protocolHelper() {
    return require('../../catalog/ActionProtocols').forType('Whiplash')
  }


}

module.exports = ActionBase
