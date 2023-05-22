const ActionBase = require('../../../base/ActionBase')

class Headline extends ActionBase {
  async perform() {
    
    const status = (this.inputValue || {}).status || 200
    const body = {
      count: this.inputValue.count,
      title: this.inputValue.title
    }

    this.response.status(status).json(body)
    return true
  }

}

module.exports = Headline
