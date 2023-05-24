
# Trivial-Core
Trivial core builds event-processing apps from templates.

## Getting Started

Building an example webhook processor app from a template.
```javascript
const { AppBuilder, AppTemplate } = require('trivial-core')

async function WriteExample() {
  const template = new AppTemplate('webhook_relay', '0.1')
  const builder = new AppBuilder()
  let manifest = await template.initialManifest()
  manifest.app_id = 'WebhookRelayDemo'
  builder.writeLocally(manifest)
}

WriteExample()

// Expected output

// [AppBuilder]    Starting to write 'WebhookRelayDemo'
// [AppBuilder]    Building...
// [CodeGenerator] Generating code...
// [CodeGenerator] Done
// [AppBuilder]    Done!
// [AppBuilder]    Results at ./slugs/WebhookRelayDemo

````

To run the app:
```shell
node slugs/WebhookRelayDemo/serve.js
```

Your app is now ready to receive POST requests at http://localhost:5000/webhooks/receive

with a JSON body, eg:
```json
{
    "name": "Kvothe",
    "nickname": "Kingkiller"
}
```

## Local Development
If you're making changes to this package while working on a project that imports this library, you'll want to link your project to the local version. This will let you use the unpublished version, without pushing to npm and re-installing. More info in the [NPM Documentation](https://docs.npmjs.com/cli/v8/commands/npm-link)

Make a global link to the local package directory:
```shell
cd ./trivial-core
npm link
```

In your example project, link to the unpublished version:
```shell
cd ../sample-project
npm link trivial-core
```

Install into your example app:
```shell
npm install trivial-core --package-lock-only
```

## Publishing
Bump the version following the [symantic versioning spec](https://docs.npmjs.com/about-semantic-versioning). Commit and push. Then:

```shell
npm publish
```