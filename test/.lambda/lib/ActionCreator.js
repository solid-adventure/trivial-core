
// const ZipWriter = require('./aws/ZipWriter')
const TokenAPIActionTemplate = require('./TokenAPIActionTemplate')
const Oauth2APIActionTemplate = require('./Oauth2APIActionTemplate')

class ActionCreator {
	  constructor(service, action, template) {
	  	this.service = service
	  	this.action = action
	  	this.template = template
	  }

	  async build() {
	  	return await this._writeTemplate()
	  }

	  async _writeTemplate() {
	  	let actionCreator
	  	if (this.template == 'token_api_action') {
	  		actionCreator = new TokenAPIActionTemplate(this.service, this.action)
	  	} else if (this.template == 'oauth2_api_action') {
	  		actionCreator = new Oauth2APIActionTemplate(this.service, this.action)
	  	}
	  	 else {
	  		return {error: `No template available: ${this.template}`}
	  	}
  		return await actionCreator.write()
	  }

}

module.exports = ActionCreator