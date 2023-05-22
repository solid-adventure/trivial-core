const ActionDescriptorBase = require('./ActionDescriptorBase')
const { GenericObject } = require('../../TrivialSchemas').TrivialSchemas

class OAuth2DescriptorBase extends ActionDescriptorBase {
  // derived classes must override this to enable token refresh
  get refreshEnabled() {
    return false;
  }

  getConfigFields() {
    const fields = {
      code_grant: {type: GenericObject, hidden: true, secret: true}
    }

    if (this.refreshEnabled) {
      fields.api_key = {type: String, hidden: true, secret: true}
    }

    return fields
  }

  get redirectUrl() {
    return this.oauth2RedirectUrl
  }

  isAuthorized(config) {
    return (config.code_grant || {}).access_token ? true : false
  }

  showAuthorizeAction(config) {
    return true
  }

  authorizeLabel(config) {
    return 'Authorize...'
  }

  reAuthorizeLabel(config) {
    return 'Re-Authorize...'
  }

  getConfigActions(config) {
    if (! this.showAuthorizeAction(config)) {
      return {}
    }

    let label = this.authorizeLabel(config)

    if (this.isAuthorized(config)) {
      label = this.reAuthorizeLabel(config)
    }

    return {
      [label]: (config, data) => this.startAuthorization(config, data)
    }
  }

  async afterAdd({app, definition, credentials}) {
    if (this.refreshEnabled) {
      try {
        const key = await this.createAPIKey(app)
        this.setCredential(definition, credentials, 'api_key', key)
      } catch (e) {
        console.error(`[${this.name}][afterAdd] Failed to create API key`, e)
      }
    }
  }

  async startAuthorization(config, data) {
    const draft = await this.saveDraft(config, data)
    const url = await this.loadAuthorizationUrl(draft.token)
    window.location = url
  }

  async saveDraft(config, data) {
    const draft = await this.saveDraftManifest(config, data)
    await this.saveDraftCredentials(config, data, draft)
    return draft
  }

  async saveDraftManifest(config, data) {
    const res = await fetch('/proxy/trivial', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        path: `/manifests/${data.manifest.id}/drafts`,
        manifest_draft: {
          action: data.action,
          content: data.manifest.content
        }
      })
    })
    const draft = await res.json()
    if (!res.ok) {
      throw new Error(`Failed to save draft: ${res.statusText}`)
    }
    return draft
  }

  async saveDraftCredentials(config, data, draft) {
    const res = await fetch('/proxy/trivial', {
      method: 'PUT',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({
        path: `/manifests/${data.manifest.id}/drafts/${draft.token}/credentials`,
        credentials: data.credentials,
      })
    })
    if (!res.ok) {
      throw new Error(`Failed to save draft credentials: ${res.statusText}`)
    }
  }

  async loadAuthorizationUrl(token) {
    const res = await fetch(`/oauth2/authorization_request/${token}`)
    const info = await res.json()
    if (!res.ok) {
      throw new Error(`Failed to build authorization url: ${res.statusText}`)
    }
    return info.url
  }
}

module.exports = OAuth2DescriptorBase
