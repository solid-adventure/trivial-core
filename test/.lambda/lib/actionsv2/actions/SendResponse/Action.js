const ActionBase = require('../../base/ActionBase')

class SendResponse extends ActionBase {
  async perform() {
    const status = (this.inputValue || {}).status || 200
    const body = (this.inputValue || {}).body

    this.response.status(status).json(body)

    return true
  }
}

module.exports = SendResponse
