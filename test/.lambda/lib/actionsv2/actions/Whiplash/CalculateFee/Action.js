// Note the local inheritance
const ActionBase = require('../ActionBase')

class CalculateFee extends ActionBase {

  async perform() {

    // TODO push transformed object to kafka


    this.setOutputValue(this.inputValue)

    return true
  }
}

module.exports = CalculateFee
