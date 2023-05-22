
const Application = require('./Application')
const manifest = require('./manifest')
const pino = require('pino')



async function performApplication(event) {
  try {
    const app = new Application(
      event,
      manifest,
      {
        logger,
        // diagnostics: this.diagnostics,
      }
    )
    const result = await app.perform()
    return result
  } catch (err) {
    console.log(err)
    return 500
  }
}

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // redact: {paths: Redactions.paths}
})

const app_id = process.env.APP_ID || '-'

let data = undefined

async function runTests() {
  data = {"reference_object":{"type":"Order","id":100000},"args":{"customer_id":321}}
  await performApplication(data)
  data = {"reference_object":{"type":"Order","id":100001},"args":{"customer_id":777}}
  await performApplication(data)
  data = {"reference_object":{"type":"Order","id":100001},"args":{"customer_id":0}}
  await performApplication(data)
}


runTests()