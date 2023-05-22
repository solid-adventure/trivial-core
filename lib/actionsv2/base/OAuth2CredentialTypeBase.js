const CredentialTypeBase = require('./CredentialTypeBase')
const { GenericObject } = require('../../TrivialSchemas').TrivialSchemas

class OAuth2CredentialTypeBase extends CredentialTypeBase {
  // derived classes must override this to enable token refresh
  get refreshEnabled() {
    return false
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
    const url = new URL('/oauth2/authorization_response', window.location.href)
    return url.href
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

  async afterCreate({app, credentials}) {
    if (this.refreshEnabled) {
      try {
        credentials.api_key = await this.createAPIKey(app)
      } catch (e) {
        console.error(`[${this.name}][afterCreate] Failed to create API key`, e)
      }
    }
  }

  async startAuthorization(config, data) {
    const draft = await this.saveDraft(config, data)
    .catch(e =>  console.error(e) )
    const url = await this.loadAuthorizationUrl(draft.token)
    .catch(e => console.error(e) )


    window.location = url
  }

  async saveDraft(config, data) {
    await this.saveCredentialSet(config, data)
      .catch(e => console.error(e) )
    const draft = await this.saveDraftManifest(config, data)
      .catch(e => console.error(e) )
    await this.saveDraftCredentials(config, data, draft)
      .catch(e => console.error(e) )
    return draft
  }

  async saveCredentialSet(config, data) {
    const credSet = await data.store.dispatch('saveCredentialSet', {
      credential_set: data.credentialSet,
      credentials: config
    })

    if (data.action.charAt(data.action.length - 1) === '/') {
      data.action = data.action + credSet.id
    }
    if (data.def && ! data.credentialSet.id) {
      data.def.config[data.configName].$cred = credSet.id
    }
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

module.exports = OAuth2CredentialTypeBase
