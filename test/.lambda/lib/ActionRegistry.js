const fstasks = require('fs');
const path = require('path')

class ActionRegistry {

	// Generates files in models-dynmaic, notably: 
	// AvailableActions.js
	// AvailablerCredentialTypes.js
	// TrivialSchemas.js

	constructor() {

	}

	build() {
		this.genAvailableActions(() => {})
		this.genAvailableCredTypes(() => {})
		this.genTrivialSchemas(() => {})
	}

	get dynamicModelsDir() {
		return path.resolve(__dirname, './models-dynamic')
	}

	// generating models-dynamic definitions
	genDynamicModelsDir() {
	  var dir = path.resolve(this.dynamicModelsDir)
	  
	  if (!fstasks.existsSync(this.dynamicModelsDir)){
	    fstasks.mkdirSync(this.dynamicModelsDir);
	  }
	}

	genAvailableActions(cb) {

	  this.genDynamicModelsDir()
	  
	  // load action Descriptors from local
	  let AVAILABLE_ACTIONS = 'const AVAILABLE_ACTIONS = Object.freeze({\n'
	  let actionsRoot = path.resolve(__dirname, './actionsv2/actions')
	  
	  const actionsDirs = fstasks.readdirSync(actionsRoot, { withFileTypes: true })
	    .filter((item) => item.isDirectory())
	    .map((item) => item.name)
	  
	  const getDescriptor = function(dir) {
	    return fstasks.readdirSync(dir, { withFileTypes: true })
	      .filter((item) => item.name === 'Descriptor.js')
	      .map((item) => dir + '/' + item.name.split('.')[0]).toString()
	  }
	  
	  actionsDirs.forEach(actionName => {
	    var actionDir = path.join(actionsRoot, actionName)
	  
	    const subDirs = fstasks.readdirSync(actionDir, { withFileTypes: true })
	      .filter((item) => item.isDirectory())
	      .map((item) => item.name)
	  
	    // parse actions and nested actions
	    if (!subDirs.length) {
	      AVAILABLE_ACTIONS += '  ' + actionName + ': require(\'../actionsv2/actions/' + actionName + '/Descriptor\'),\n'
	    } else {
	      var action = '  ' + actionName + ': {\n'
	      subDirs.forEach(subDir => {
	        action += '    ' + subDir + ': require(\'../actionsv2/actions/' + actionName + '/' + subDir + '/Descriptor\'),\n'
	      })
	      action += '  },\n'
	      AVAILABLE_ACTIONS+= action
	    }
	  })
	  AVAILABLE_ACTIONS += '})\n\nmodule.exports = AVAILABLE_ACTIONS\n'

	  fstasks.writeFileSync(path.resolve(this.dynamicModelsDir, 'AvailableActions.js'), AVAILABLE_ACTIONS);

	  cb()
	}

	genAvailableCredTypes(cb) {

	  this.genDynamicModelsDir()
	  
	  // load action Descriptors from local
	  let AVAILABLE_TYPES = 'const AVAILABLE_TYPES = Object.freeze({\n'
	  let actionsRoot = path.resolve(__dirname, './actionsv2/actions')

	  const actionsDirs = fstasks.readdirSync(actionsRoot, { withFileTypes: true })
	    .filter((item) => item.isDirectory())
	    .map((item) => item.name)
	  
	  const getCredType = function(dir, actionName) {
	    return fstasks.readdirSync(dir, { withFileTypes: true })
	      .filter((item) => item.name === 'CredentialType.js')
	      .map((item) => '../actionsv2/actions/' + actionName + "/" + item.name.split('.')[0]).toString()
	  }

	  actionsDirs.forEach(actionName => {
	    var actionDir = path.join(actionsRoot, actionName)

	    var creds = getCredType(actionDir, actionName)
	    if ( creds.length ) {
	      AVAILABLE_TYPES += '  ' + actionName + 'Credentials: require(\'' + creds + '\'),\n'
	    }
	  })
	  AVAILABLE_TYPES += '})\n\nmodule.exports.AVAILABLE_TYPES = AVAILABLE_TYPES\n'

	  fstasks.writeFileSync(path.resolve(this.dynamicModelsDir, 'AvailableCredentialsTypes.js'), AVAILABLE_TYPES);

	  cb()
	}

	genTrivialSchemas(cb) {
		let baseSourceDir = path.resolve(__dirname, '../source')
	  let trivialSchemas = {}

	  // dynamic action folder handled here
	  const items = this.getFilteredFiles(path.resolve(baseSourceDir, 'lib/actionsv2'), 'Schemas.js')
	  items.forEach(item => {
	    trivialSchemas[item.parentDir] = `const ${item.parentDir} = require('../actionsv2/actions/${item.parentDir}/${item.name.split('.')[0]}')\n`
	  })

	  const sorted = Object.keys(trivialSchemas).sort().reduce((accumulator, key) => {
	                    accumulator[key] = trivialSchemas[key];
	                    return accumulator;
	                  }, {});

	  // build the text to write out                
	  let trivialSchemasText = ''

	  Object.values(sorted).forEach(item => {
	    trivialSchemasText += item
	  })

	  trivialSchemasText += `\nconst TrivialSchemas = {\n`
	  Object.keys(sorted).forEach(item => {
	    trivialSchemasText += `  ...${item},\n`
	  })
	  trivialSchemasText += `}\n\nmodule.exports = TrivialSchemas\n`

	  fstasks.writeFileSync(path.resolve(this.dynamicModelsDir, 'TrivialSchemas.js'), trivialSchemasText);
	  cb()
	}

	getFilteredFiles(dirName, matcher, recursive=true) {
	  let files = [];
	  const items = fstasks.readdirSync(dirName, { withFileTypes: true })

	  for (const item of items) {
	    if (item.isDirectory() && recursive) {
	      files = [...files, ...this.getFilteredFiles(`${dirName}/${item.name}`, matcher, recursive)]
	    } else {
	        if (item.name == matcher) { 
	          files.push({dirName: dirName,
	                      parentDir: dirName.split('/').pop(),
	                      name: item.name})
	        }
	    }
	  }

	  return files;
	}

}

module.exports = ActionRegistry