class ContextManager {
	constructor(factory) {
		this.factory = factory
		this._additionalParamsForContext = {}
	}

	setContext(context, additionalParams) {
		this._additionalParamsForContext[context] = additionalParams
	}

  additionalParamsForContext(context) {
  	return this.approvedContexts(context).
  	map(c => this._additionalParamsForContext[c])
  	.filter(c => c)
  	.flat()
  }

  approvedContexts(context) {
  	let out = this.contexts()
  	out = out.filter(x => Object.keys(x || {}) == context)
  	out = out.map(x => x[context]).flat()
  	return out
  }

  contexts() {
  	return [].concat(this.allChildContexts(), this.invertChildContexts())
  }

  allChildContexts() {
  	return this.childContexts(this.factory.nameToGenerator)
  }

  childContexts(block) {
  	// console.log(`[ContextManager] ${JSON.stringify(block, this.revive, 2)}`)
  	let out = []
  	for (let k of Object.keys(block)) {
  		out.push(this.collectGenerators(k, block[k]._generators || []))
  	}
  	return out
  }

  collectGenerators(key, generators) {
  	let out = {}
		out[key] = generators.map(g => g.name)
		return out
  }

  invertChildContexts() {
	  let out = []
	  for (let spec of this.allChildContexts()) {	     
	     for (let v of spec[Object.keys(spec)]) {
	       let o = {}
	       o[v] = Object.keys(spec)
	       out.push(o)
	     }
	  }  
	  return out
  }

  revive(k, v) {
  	if (k == 'factory') {
 			return null
		} else {
			return v
		}
  }

  _contextMappings() {
    let out = this._additionalParamsForContext
    for (let pair of this.contexts()) {
    	let context = Object.keys(pair)[0]
      let addlParams = this.additionalParamsForContext(context) 
    	if (addlParams.length > 0 ) {out[context] = [...new Set(addlParams)] }
    }
	  return out
  }

  definition() {
  	return `class ContextManager {\n` +
		   		  `  constructor() {\n` +
		   		 `  }\n` +
			     `    static get mappings() {\n` +
			     `      return ${JSON.stringify(this._contextMappings(), null, 2)}\n` +
			     `    }\n` +
		   		 `}\n` +
		   		 `module.exports = ContextManager`
  }

  touch() {
  	this._contextMappings()
  }

  _referenceDeclarations(context) {
  	this.touch() // Crawl the tree so children have access to full context
  	let out = []
  	for (let ref of this.additionalParamsForContext(context)) {
  		out.push(this._referenceDeclaration(ref))
  	}
  	return [... new Set(out)]
  }

  _referenceDeclaration(reference) {
		return reference ? `let ${reference} = additionalParams.${reference}` : ''
  }



}

module.exports = ContextManager