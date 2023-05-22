const path = require('path')

// const Secret = require(__dirname + '/Secret.js');
module.exports = class APISpec {

	constructor(service) {

		this.service = service
		this.init()

	}

	init() {
		try {
			this.spec = require(`./ApiSpecs/${process.env.API_ENV || 'staging'}/${this.service}`)
		} catch {
			this.spec = "not found"
		}
	}

  // Set arbitrary headers and save to cookies
	setCookies(res, headers) {
		let keys = Object.keys(headers)
		for (let key of keys) {
			let prepended = this.prependService(key)
			res.cookie(prepended, headers[key], {signed: true})
		}
	}

  // Search the inbound response for headers that match the spec, and save to cookies
	setSpecHeaders(res, headers) {
		if (!Array.isArray(this.spec.headers)) { return false }
    for (let h of this.spec.headers){
    	if (headers[h]) {
			let prepended = this.prependService(h)
			res.cookie(prepended, headers[h], {signed: true})
    	}
    }
	}

	// Search cookies for headers that match the spec, and add to the outbound headers
	injectHeaders(req, serviceReq) {
		if (!Array.isArray(this.spec.headers)) { return false }

	  let toInject = {}
	  for (let h of this.spec.headers){
		if (req.signedCookies[this.prependService(h)]) {
			// inject header WITHOUT prepend - access signed cookie WITH prepend
			let stripped = this.removePrepend(h)
			let prepended = this.prependService(h)
			toInject[stripped] = req.signedCookies[prepended]
	    }
	  }
	  Object.assign(serviceReq.headers, toInject)
	}

	injectQueryParams(req, serviceReq){
		if(!Array.isArray(this.spec.queryParams)) {return false}

		let toInject= {}
		for(let qp of this.spec.queryParams){
			if(req.signedCookies[this.prependService(qp)]){
				let stripped = this.removePrepend(qp)
				let prepended = this.prependService(qp)
				toInject[stripped] = req.signedCookies[prepended]
			}
		}
		serviceReq.url = this.appendQueryParameters(serviceReq.url, toInject)
	}

	injectCredentials(req, serviceReq){
  	if (this.isResetRequest(req, serviceReq)) {
  	  this.injectResetHeaders(req, serviceReq)
  	} else {
  		this.injectHeaders(req, serviceReq)
  		this.injectQueryParams(req, serviceReq)
  	}
	}

  isResetRequest(req, serviceReq) {
    return this.spec.resetHeader &&
      req.signedCookies[this.prependService(this.spec.resetHeader)] &&
      this.isAllowedServiceCall(serviceReq)
  }

  isAllowedServiceCall(serviceReq) {
    return this.spec.resetCalls &&
      undefined !== this.spec.resetCalls.find(call => {
        return call[0].toUpperCase() == serviceReq.method.toUpperCase() &&
          call[1] == new URL(serviceReq.url).pathname
      })
  }

  injectResetHeaders(req, serviceReq) {
    const headers = JSON.parse(req.signedCookies[this.prependService(this.spec.resetHeader)])
    this.spec.headers.forEach(h => serviceReq.headers[h] = headers[h])
  }

	serviceListMissingHeaders(req) {
		let undefined_headers = []
		for (let h of this.spec.headers){
			if(req.signedCookies[this.prependService(h)] == undefined){
				undefined_headers.push(h)
			}
		}
		return undefined_headers
	}

	serviceListMissingQueryParams(req){
		let undefined_queryParams = []
		for (let qp of this.spec.queryParams){
			if(req.signedCookies[this.prependService(qp)] == undefined){
				undefined_queryParams.push(qp)
			}
		}
		return undefined_queryParams
	}

	serviceMissingHeaders(req) {
		return this.serviceListMissingHeaders(req).length > 0
	}

	serviceMissingQueryParams(req){
		return this.serviceListMissingQueryParams(req).length > 0
	}

	createRequest(options) {
		const spec = this.spec

		this.url = new URL(spec.url)
		this.body = null
		this.headers = {}
		this.contentType = null
		this.options = options
		this.setURL()
		this.setForm()
		this.setBody()
		this.setHeaders()
		this.unwrapSecrets()

		// All  options besides path get url encoded and added to the query string
		Object.keys(this.options).forEach(key => {
		  this.url.searchParams.set(key, this.options[key])
		})

  		// json: true is required for express to parse the object
		let url = this.url.href,
			headers = this.headers,
			body = this.body
  		let out = {url, headers, json: true}
  		// Only add the body if its defined to prevent GET requests from being malformed
  		if (body && !this.contentType) {
  			Object.assign(out, {body: body})
  		} else if (body && (this.contentType == 'form' || this.contentType == 'application/x-www-form-urlencoded')) {
  			Object.assign(out, {form: body})
  		}

		return out
	}

	prependService(name){
		return this.service.concat(`-${name}`)
	}

	removePrepend(name){
		let service = `${this.service}-`
		let re = new RegExp(`^${service}`, "i")
		return name.replace(re,"")
	}

	appendQueryParameters(url, new_params){
		let urlObj = new URL(url)
		for(let [key,value] of Object.entries(new_params)){
			urlObj.searchParams.set(key,value)
		}
		return urlObj.href
	}

	setURL(){
		if (this.options && this.options.body && this.options.body.path) {
			this.url.pathname = path.join(this.url.pathname, this.options.body.path)
			delete this.options.body.path
		} else if (this.options && this.options.path) {
			this.url.pathname = path.join(this.url.pathname, this.options.path)
			delete this.options.path
		}
	}

	setForm(){
		if (this.options && this.options.body && this.options.body.contentType) {
			this.contentType = this.options.body.contentType
			delete this.options.body.contentType
		}
	}

	setBody(){
		if (this.options && this.options.body) {
			this.body = this.options.body
			delete this.options.body
		}
	}

	setHeaders(){
		if (this.options && this.options.headers) {
			this.headers = Object.fromEntries(new URLSearchParams(this.options.headers).entries())
			delete this.options.headers
		}
	}

	unwrapSecrets(){
		// Secret.unwrapByMarker(this.options, 'getTrivialSecret')
		// Secret.unwrapByMarker(this.options.body, 'getTrivialSecret')
	}

}

