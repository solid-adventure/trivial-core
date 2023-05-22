const { Pool, Client } = require('pg')
const SocksConnection = require('socksjs');
const fixieUrl = process.env.FIXIE_SOCKS_HOST || '';
const fixieValues = fixieUrl.split(new RegExp('[/(:\\/@)/]+'));

class PostgreSQLConnection  {

    // Shared logic to relay postres connection through a static IP
    // https://devcenter.heroku.com/articles/fixie-socks#using-via-native-socksv5-support
    static pool(credentials) {

        const pgServer = {
          host: credentials.host,
          port: credentials.port
        };

        const fixieConnection = new SocksConnection(pgServer, {
          user: fixieValues[0],
          pass: fixieValues[1],
          host: fixieValues[2],
          port: fixieValues[3]
        });

        const connectionConfig = {
          user: credentials.user,
          password: credentials.password,
          database: credentials.database,
          stream: fixieConnection,
          ssl: credentials.ssl
        };

        return new Pool(connectionConfig)
    }

    static outputValueForError(e) {
        console.log(`[PostgreSQLConnection][outputValueForError] ${e}`)
        if (e.code == 'ENOTFOUND') {
          return {results: {message: "Could not connect to PostgreSQL database", stack: e.stack}, status: 404}
        }

        if (e == 'SOCKS: Host unreachable') {
          return {results: {message: "Could not connect to PostgreSQL database"}, status: 404}
        }

        return {results: {message: e.message, stack: e.stack, data: e}, status: 422}
    }

}
module.exports = PostgreSQLConnection