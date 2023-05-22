const ActionBase = require('../../base/ActionBase')

class Stop extends ActionBase {
  async perform() {
    return false
  }
}

module.exports = Stop
