const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

class SendSMSDescriptor extends ActionDescriptorBase {
  get expectedTypeName() {
    return 'TrivialSMSMessage'
  }

  get iconUrl() {
    return '/assets/images/action-icons/trivial.svg'
  }

  get configFields() {
    return {
      api_key: {type: String, required: true, secret: true, hidden: true}
    }
  }

  async afterAdd({app, definition, credentials}) {
    try {
      const key = await this.createAPIKey(app)
      this.setCredential(definition, credentials, 'api_key', key)
    } catch (e) {
      console.error(`[${this.name}][afterAdd] Failed to create API key`, e)
    }
  }
}
module.exports = SendSMSDescriptor
