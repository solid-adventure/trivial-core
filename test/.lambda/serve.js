const express = require('express')
const serve = express()
const Redactions = require('./lib/Redactions')
require('./setup')()
const pino = require('pino')
const pinoHttp = require('pino-http')
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {paths: Redactions.paths}
})
const expressLogger = pinoHttp({ logger })
const Webhook = require('./Webhook')

const PORT = process.env.PORT || 5000
const app_id = process.env.APP_ID || '-'
const RECEIVE_VERB = process.env.RECEIVE_VERB || 'post'
const RECEIVE_PATH = process.env.RECEIVE_PATH || '/webhooks/receive'
const LOG_TO_URL = process.env.LOG_TO_URL || 'https://trivial-api-staging.herokuapp.com/webhooks'
const LOG_TO_VERB = process.env.LOG_TO_VERB || 'post'

serve.use(expressLogger)
serve.use((req, res, next) => {
  // don't log the full request on every subsequent log invocation
  req.log = expressLogger.logger.child({req: {id: req.id}})
  next()
})
serve.use(express.json());

serve[RECEIVE_VERB](RECEIVE_PATH, async (req, res) => {
  let status = 500
  try {
    const webhook = new Webhook(app_id, req, res, {url: LOG_TO_URL, verb: LOG_TO_VERB})
    status = await webhook.process()
  } catch (err) {
    req.log.error({err}, 'Webhook processing failed')
  }
  req.log.info({status}, 'Webhook completed')
  if (! res.headersSent) {
	  res.sendStatus(status)
  }
})


let httpServer = serve.listen(PORT, () => {
  logger.info(`Trivial Webhook Relay running at port: ${PORT}, app_id: ${app_id}`);
});

// the following functions are to support unit testing

module.exports.ready = async function() {
  if (httpServer.listening) {
    return Promise.resolve(httpServer)
  } else {
    return new Promise(resolve => httpServer.once('listening', () => resolve(httpServer)))
  }
}

module.exports.shutdown = async function() {
  return new Promise(resolve => httpServer.close(resolve))
}
