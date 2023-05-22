const ActionBase = require('../../../base/ActionBase')
const mysql = require('mysql')

class Query extends ActionBase {
  async perform() {

    let credentials = {
      user: this.config.MySQL.user,
      host: this.config.MySQL.host,
      database: this.config.MySQL.database,
      password: this.config.MySQL.password,
      port: this.config.MySQL.port
    }

    this.connection = mysql.createConnection(credentials);
    let results = await this.query()
    this.setOutputValue({results: results, status: 200})
    return true
  }

  async query() {
    return new Promise((resolve, reject) => {
      this.connection.query(this.inputValue.query, function (error, results, fields) {
        if (error) { reject(error) }
        resolve(results, fields)
      })
    })
  }

}

module.exports = Query
