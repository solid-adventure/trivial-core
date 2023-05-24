const AppBuilder = require('../lib/AppBuilder')
const AppTemplate = require('../lib/AppTemplate')

async function WriteExample() {
  const template = new AppTemplate('webhook_relay', '0.1')
  const builder = new AppBuilder()
  let manifest = await template.initialManifest()
  manifest.app_id = 'WebhookRelayDemo'
  builder.writeLocally(manifest)
}

WriteExample()

// [AppBuilder]    Starting to write 'WebhookRelayDemo'
// [AppBuilder]    Building...
// [CodeGenerator] Generating code...
// [CodeGenerator] Done
// [AppBuilder]    Done!
// [AppBuilder]    Results at ./slugs/WebhookRelayDemo
