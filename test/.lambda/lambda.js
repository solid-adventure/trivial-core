const ElbRequest = require('./lib/ElbRequest')
const ElbResponse = require('./lib/ElbResponse')
const Redactions = require('./lib/Redactions')
require('./setup')()
const pino = require('pino')
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {paths: Redactions.paths}
})
const Webhook = require('./Webhook')

const APP_ID = process.env.APP_ID || '-'
const LOG_TO_URL = process.env.LOG_TO_URL || 'https://trivial-api-staging.herokuapp.com/webhooks'
const LOG_TO_VERB = process.env.LOG_TO_VERB || 'post'

async function handler(event, context) {
  let status = 500
  const req = new ElbRequest(event)
  const res = new ElbResponse()
  req.log = logger

  try {
    const webhook = new Webhook(APP_ID, req, res, {url: LOG_TO_URL, verb: LOG_TO_VERB})
    status = await webhook.process()
  } catch (err) {
    req.log.error({err}, 'Webhook processing failed')
  }
  req.log.info({status}, 'Webhook completed')
  if (! res.headersSent) {
	  res.sendStatus(status)
  }

  return res.toJSON()
}
module.exports.handler = handler
