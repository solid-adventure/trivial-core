const ActionBase = require('../../../base/ActionBase')

class CrateLabel extends ActionBase {
  async perform() {

    const status = (this.inputValue || {}).status || 200
    const body = {
      appName: this.inputValue.appName,
      header: this.inputValue.header,
      disclaimer: this.inputValue.disclaimer,
      footerLabel: this.inputValue.footerLabel,
      footerText: this.inputValue.footerText,
      headlines: this.inputValue.headlines
    }

    this.response.status(status).json(body)
    return true

  }


}

module.exports = CrateLabel
