
# Trivial-Core
Build event-driven apps from templates. Full documentation at [trivial-js.org](https://trivial-js.org).

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

## Running Tests
```shell
npm test
```

```javascript
//  Expected output

//> trivial-core@1.0.2 test
//> mocha 'test/**/*.js'
//  ...
//  456 passing (784ms)
//  2 pending
```

## General Development
**When running** `trivial-core` **it is necessary to build the** `ActionRegistry`

In a local or server environment this is accomplished by entering the containing directory and running `npm run build` which includes all necessary logic.

However, when using `trivial-core` as dependency in a project or within a container you will need to construct the `ActionRegistry` as a part of your build step.

For example, if running your project within Docker you might create a `build.js` script to run as a part of your `Dockerfile`:
```javascript
# build.js
const { ActionRegistry } = require('trivial-core')
const actionRegistry = new ActionRegistry()

console.log("Building ActionRegistry...")

try {
  actionRegistry.build()
  console.log("ActionRegistry built")
} catch (err) {
  console.log("Failed to build ActionRegistry")
  console.error(err)
}

# package.json
[other package information]
"scripts": {
  [your other scripts]
  "build": "node build.js"
}

# dockerfile
[other build logic]
RUN npm run build

```

## Local Development
If you're making changes to this package while working on a project that imports this library, you'll want to link your project to the local version. This will let you use the unpublished version, without pushing to npm and re-installing. More info in the [NPM Documentation](https://docs.npmjs.com/cli/v8/commands/npm-link)

**Note: If the Node versions are not the same for the package and the project you're importing into, `npm link` fail silently.**

Make a global link to the local package directory:
```shell
cd ./trivial-core
nvm use vX.X.X # X.X.X should be match the dependent project's node version
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

## External Actions
You can supplement the catalog of actions trivial-core ships with.

Using gulp or a similar pre-builder, copy the action files into the package's action directory and build:

```javascript
const { ActionRegistry } = require('trivial-core')
const actionRegistry = new ActionRegistry()

// Copy the files from your app into the package
function copyActionFiles(){
  return gulp.src(`source/lib/actions/**`) // this is the location of the new actions in your project
    .pipe(gulp.dest(`${actionRegistry.actionsRoot}/actionsv2/actions`)) // internal action location; unlikely you need to change this
}

// Define a gulp task to call the copyActionFiles function, then rebuild the registry
gulp.task('build', gulp.series(copyActionFiles, actionRegistry.build)

// In the shell, run the gulp task to copy the files to trivial-core and rebuild the action library files.
gulp build

```

## Publishing
Bump the version following the [symantic versioning spec](https://docs.npmjs.com/about-semantic-versioning). Commit and push. Then:

```shell
npm publish
```
