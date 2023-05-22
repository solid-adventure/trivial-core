const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const match = sinon.match
const AppBuilder = require('../../lib/AppBuilder')
const AppTemplate = require('../../lib/AppTemplate')
const AppManager = require('../../lib/AppManager')
chai.use(require('sinon-chai'))

describe("AppBuilder", () => {

  describe('_createLambda', () => {
    let builder = new AppBuilder('UnitTest')
    let template = new AppTemplate('webhook_relay', '0.1')
    let manifest = null
    let role = 'arn:aws:iam::123456789:role/example'
    let client = {
      send: sinon.stub().resolves({})
    }

    before(async () => {
      manifest = await template.initialManifest()
      sinon.stub(builder, '_normalizeManifest').resolvesArg(0)
      sinon.stub(builder, '_waitUntilLambdaReady').resolves()
      sinon.stub(builder, '_routeToLambda').resolves()
      sinon.stub(builder, '_initLambdaLogs').resolves()
      sinon.stub(builder, '_uploadLambda').callsFake(async (manifest, writer, layers) => {
        await builder._createLambda(manifest, writer, layers, client)
      })
      sinon.stub(AppManager, 'info').resolves({aws_role: role})

      await builder.build(manifest)
    })

    after(() => AppManager.info.restore())

    it('creates a lambda with the role specified by the API', () => {
      expect(client.send).to.have.been.calledOnceWith(
        match.has('input', match.has('Role', role))
      )
    })
  })

  describe('_ensureCorrectLayers', () => {
    let builder = new AppBuilder('UnitTest')
    let client = {
      send: sinon.stub().resolves({})
    }

    async function callWith(oldLayers, newLayers) {
      client.send.resetHistory()
      let info = {
        Configuration: {
          FunctionName: 'UnitTest',
          Layers: (oldLayers || []).map(l => {return {Arn: l}})
        }
      }
      return await builder._ensureCorrectLayers(client, info, newLayers)
    }

    it('adds missing layers', async () => {
      const newLayer = 'arn:aws:lambda:us-east-2:404573752214:layer:webhook_relay_0_1:5'
      await callWith([], [newLayer])
      expect(client.send).to.have.been.calledOnceWith(
        match.has('input', match.has('Layers', [newLayer]))
      )
    })

    it('updates layers with a new version', async () => {
      const oldLayer = 'arn:aws:lambda:us-east-2:404573752214:layer:webhook_relay_0_1:4'
      const newLayer = 'arn:aws:lambda:us-east-2:404573752214:layer:webhook_relay_0_1:5'
      await callWith([oldLayer], [newLayer])
      expect(client.send).to.have.been.calledOnceWith(
        match.has('input', match.has('Layers', [newLayer]))
      )
    })

    it("ignores layers it doesn't know about", async () => {
      const oldLayer = 'arn:aws:lambda:us-east-2:404573752214:layer:webhook_relay_0_1:4'
      const otherLayer = 'arn:aws:lambda:us-east-2:404573752214:layer:extra_1_5:2'
      const newLayer = 'arn:aws:lambda:us-east-2:404573752214:layer:webhook_relay_0_1:5'
      await callWith([oldLayer, otherLayer], [newLayer])
      expect(client.send).to.have.been.calledOnceWith(
        match.has('input', match.has('Layers', [otherLayer, newLayer]))
      )
    })
  })

})
