const { expect } = require('chai')
const express = require('express')
const path = require('path')
const fs = require('fs').promises
const AdmZip = require('adm-zip')
const AppBuilder = require('../../../lib/AppBuilder')
const AppTemplate = require('../../../lib/AppTemplate')
const origEnv = Object.assign(process.env)

class WebhookRecorder {
  constructor() {
    this.reset()
  }

  async start() {
    this.server = express()
    this.server.use(express.json())
    this.server.post('/webhooks', (req, res) => {
      this.webhooks.push(req.body)
      res.status(200).send({...req.body, update_id: (this.webhooks.length).toString()})
    })
    this.server.put('/webhooks/:id', (req, res) => {
      this.updates.push({id: req.params.id, body: req.body})
      res.sendStatus(200)
    })
    this.server.post('/actions', (req, res) => {
      this.actionCalls.push(req.body)
      res.json({message: 'ok'})
    })
    return new Promise((resolve, reject) => {
      this.httpServer = this.server.listen((err) => {
        if (err) {
          reject(err)
        } else {
          this.port = this.httpServer.address().port
          resolve()
        }
      })
    })
  }

  async stop() {
    return new Promise(resolve => this.httpServer.close(resolve))
  }

  reset() {
    this.webhooks = []
    this.actionCalls = []
    this.updates = []
  }
}

class TestAppBuilder extends AppBuilder {
  get tmpDir() {
    return path.resolve(__dirname, path.join('..', '..', '.lambda'))
  }

  async _normalizeManifest(input) {
    return input
  }

  async _uploadLambda(manifest, writer, layers) {
    await fs.mkdir(this.tmpDir)
    const zip = new AdmZip(await writer.toBuffer())
    zip.extractAllTo(this.tmpDir, true)
  }

  async teardown() {
    await fs.rmdir(this.tmpDir, {recursive: true})
  }
}

function restoreEnv() {
  Object.keys(process.env).forEach(key => {
    if (!origEnv.hasOwnProperty(key))
      delete process.env[key]
  })
  Object.assign(process.env, origEnv)
}

describe("webhook_relay 0.1 (lambda invocation)", () => {

  const template = new AppTemplate('webhook_relay', '0.1')
  const builder = new TestAppBuilder('.unittest')
  const logServer = new WebhookRecorder()
  const payload = {hello: 'world!'}
  let serverModule = null

  before(async () => {
    await logServer.start()
    // const manifest = await template.initialManifest()
    const manifest = {
      "manifest_version": 2,
      "template": "webhook_relay",
      "version": "0.1",
      "app_id": "",
      "listen_at": {
        "host": "localhost",
        "port": "",
        "verb": "post",
        "path": "/webhooks/receive"
      },
      "log_to": {
        "host": "https://trivial-api-staging.herokuapp.com",
        "port": "443",
        "verb": "post",
        "path": "/webhooks"
      },
      "program": {},
      "definitions": []
    }
    manifest.app_id = '.unittest'
    manifest.log_to.host = `http://localhost:${logServer.port}`
    manifest.program = {
      identifier: "1",
      enabled: true,
      definition: {
        actions: [{
          identifier: "2",
          enabled: true,
          name: "Is Challenge",
          type: "If",
          definition: {
            condition: "payload.challenge",
            then: [{
              identifier: "3",
              type: "Transform",
              enabled: true,
              definition: {
                from: "GenericObject",
                to: "GenericObject",
                transformations: [
                  {from: "challenge", to: "body.challenge"}
                ]
              }
            }, {
              identifier: "4",
              enabled: true,
              type: "SendResponse"
            }],
            else: [{
              identifier: "5",
              enabled: true,
              type: "Transform",
              definition: {
                from: "GenericObject",
                to: "GenericObject",
                transformations: [
                  {from: "greet(hello)", to: "message"}
                ]
              }
            }, {
              identifier: "6",
              enabled: true,
              type: "HttpRequest",
              config: {
                url: `http://localhost:${logServer.port}/actions`,
                method: 'POST'
              }
            }]
          },
        }]
      }
    }
    manifest.definitions.push({
      name: "greet",
      type: "function",
      definition: "function greet (value) { return `Greetings, ${value}` }",
      notes: "Returns a greeting string"
    })

    await builder.build(manifest)
    process.env.APP_ID = manifest.app_id
    process.env.LOG_TO_URL = `http://localhost:${logServer.port}/webhooks`
    process.env.LOG_TO_VERB = 'post'
    serverModule = require(`${builder.tmpDir}/lambda`)
  })

  after(async () => {
    await logServer.stop()
    await builder.teardown()
    restoreEnv()
  })

  describe("lambda.handler()", () => {
    context('with a payload that matches an action', () => {
      const body = JSON.stringify(payload)
      const event = {
        requestContext: { elb: {} },
        httpMethod: 'POST',
        path: '/webhooks/receive',
        queryStringParameters: {},
        headers: {
          accept: '*/*',
          'content-length': body.length,
          'content-type': 'application/json',
          host: 'test-lb-1990480126.us-east-2.elb.amazonaws.com',
          'user-agent': 'curl/7.64.1',
          'x-amzn-trace-id': 'Root=1-611eac99-50055f620f8e24a44791cd50',
          'x-forwarded-for': '192.168.0.1',
          'x-forwarded-port': '80',
          'x-forwarded-proto': 'http'
        },
        body: body,
        isBase64Encoded: false
      }
      const context = {}
      let response = null

      before(() => logServer.reset())
      before(async () => response = await serverModule.handler(event, context))

      it('returns 200', () => {
        expect(response).to.include({statusCode: 200})
      })

      it('performs the action', () => {
        expect(logServer.actionCalls[0]).to.eql({message: 'Greetings, world!'})
      })

      it('logs the payload at the start of the request', () => {
        expect(logServer.webhooks[0].payload).to.eql(payload)
      })

      it('updates the log with the provided id on completion', () => {
        expect(logServer.updates[0].id).to.eql('1')
      })

      it('updates the log with status', () => {
        expect(logServer.updates[0].body.status).to.eql(200)
      })

      it('completes without errors', () => {
        expect(logServer.updates[0].body.diagnostics.errors).to.eql([])
      })
    })

    context('with a payload that triggers a response', () => {
      const payload = {challenge: '9rtThrKHY54Q4s/inAkf72VtmimCf4p+'}
      const body = JSON.stringify(payload)
      const event = {
        requestContext: { elb: {} },
        httpMethod: 'POST',
        path: '/webhooks/receive',
        queryStringParameters: {},
        headers: {
          accept: '*/*',
          'content-length': body.length,
          'content-type': 'application/json',
          host: 'test-lb-1990480126.us-east-2.elb.amazonaws.com',
          'user-agent': 'curl/7.64.1',
          'x-amzn-trace-id': 'Root=1-611eac99-50055f620f8e24a44791cd50',
          'x-forwarded-for': '192.168.0.1',
          'x-forwarded-port': '80',
          'x-forwarded-proto': 'http'
        },
        body: body,
        isBase64Encoded: false
      }
      const context = {}
      let response = null

      before(() => logServer.reset())
      before(async () => response = await serverModule.handler(event, context))

      it('returns 200', () => {
        expect(response).to.include({statusCode: 200})
      })

      it('logs the payload', () => {
        expect(logServer.webhooks[0].payload).to.eql(payload)
      })

      it('completes without errors', () => {
        expect(logServer.updates[0].body.diagnostics.errors).to.eql([])
      })

      it('sends a response', () => {
        expect(response).to.include({body: `{"challenge":"${payload.challenge}"}`})
      })
    })
  })

})
