const ActionBase = require('../../../base/ActionBase')
const PostgreSQLConnection = require('../Connection')
const { DefaultSampleConnection, DefaultSampleDatabaseName } = require('../Schemas')

class Query extends ActionBase {
  async perform() {
    let credentials;
    if (this.config.PostgreSQL.database === DefaultSampleDatabaseName) {
      credentials = DefaultSampleConnection
    } else {
      credentials = {
        user: this.config.PostgreSQL.user,
        host: this.config.PostgreSQL.host,
        database: this.config.PostgreSQL.database,
        password: this.config.PostgreSQL.password,
        port: this.config.PostgreSQL.port,
        ssl: {
          rejectUnauthorized: false // TODO: set rejectUnauthorized to true for non-dev
        }
      }
    }

    let results
    const pool = PostgreSQLConnection.pool(credentials)

    await pool.query(this.inputValue.query)
    .then(res => results = {results: res.rows, status: 200})
    .catch(e =>  results = PostgreSQLConnection.outputValueForError(e) )

    this.setOutputValue(results)

    return true
  }

  getOutputValueForError(e) {
    console.log(`[getOutputValueForError] ${e}`)
    if (e.code == 'ENOTFOUND') {
      return {results: {message: "Could not connect to PostgreSQL database", stack: e.stack}, status: 404}
    }

    if (e == 'SOCKS: Host unreachable') {
      return {results: {message: "Could not connect to PostgreSQL database"}, status: 404}
    }

    return {results: {message: e.message, stack: e.stack, data: e}, status: 422}
  }

}

module.exports = Query
