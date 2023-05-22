const ActionBase = require('../../../base/ActionBase')

class Spreadsheet extends ActionBase {
  async perform() {

    const status = (this.inputValue || {}).status || 200
    const body = {
      rows: this.inputValue.rows,
      columnNames: this.inputValue.columnNames
    }

    this.response.status(status).json(body)
    return true
  }


}

module.exports = Spreadsheet
