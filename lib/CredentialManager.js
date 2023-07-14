const awsFetch = require('./aws-fetch')
const fetch = require('node-fetch')
const pino = require('pino')
const logger = pino({level: process.env.LOG_LEVEL || 'info'})

const MAX_TTL = 15 * 60 * 1000

class CredentialManager {
  static async resolveCredentials(config) {
    const out = {}
    for (let [name, value] of Object.entries(config)) {
      if (this.isReference(value)) {
        out[name] = await this.getByReference(value)
      } else if (this.isCredentialSet(value)) {
        out[name] = await this.getCredentialSet(value)
      } else if (this.isEnv(value)) {
        out[name] = this.getFromEnv(value)
      } else {
        out[name] = value
      }
    }
    return out
  }

  static isReference(val) {
    return val && val.hasOwnProperty('$ref')
  }

  static isCredentialSet(val) {
    return val && val.hasOwnProperty('$cred')
  }

  static isEnv(val) {
    return val && val.hasOwnProperty('$env')
  }

  static async getByReference(ref) {
    return await this.get(...ref.$ref)
  }

  static async getCredentialSet(ref) {
    return await this.credentialSet(ref.$cred)
  }

  static getFromEnv(ref) {
    return process.env[ref.$env]
  }

  static async get(name, item) {
    const credentials = await this.credentials()
    const section = credentials[name]
    if (section && item) {
      return section[item]
    } else {
      return section
    }
  }

  static async credentials() {
    if (this.hasCachedCredentials()) {
      return this._credentials
    }

    if (process.env.CREDENTIALS_SERVICE === 'TRIVIAL-API' && process.env.TRIVIAL_API_KEY) {
      const res =  await fetch(
        new URL(`/apps/${process.env.APP_ID}/credentials/app`, process.env.LOG_TO_URL).href, {
        method: 'GET',
        headers: {
          'x-trivial-app-id': process.env.APP_ID,
          'content-type': 'application/json',
          'authorization': `Bearer ${process.env.APP_API_KEY}`
        },
      })
      const json = await res.json()
      this._credentials = json.credentials
      this._credentialsLoadedAt = Date.now()
      return json.credentials
    }

    const key = `credentials/${process.env.APP_ID}`
    const response = await awsFetch('/', {
      service: 'secretsmanager',
      method: 'post',
      headers: {
        'X-Amz-Target': 'secretsmanager.GetSecretValue',
        'Content-Type': 'application/x-amz-json-1.1'
      },
      body: JSON.stringify({SecretId: key})
    })
    this.logger().debug({secretId: key, status: response.status, statusText: response.statusText}, '[CredentialManager][credentials] GetSecretValue')
    const body = await response.json()

    if (! response.ok) {
      throw new Error(`Failed to load credentials - ${body.Message}`)
    }

    this._credentials = JSON.parse(body.SecretString)
    this._credentialsLoadedAt = Date.now()

    return this._credentials
  }

  static hasCachedCredentials() {
    return (this._credentials && (Date.now() - this._credentialsLoadedAt < MAX_TTL))
  }

  static async credentialSet(id) {
    if (!this.hasCachedCredentialSet(id)) {
      if (process.env.CREDENTIALS_SERVICE === 'TRIVIAL-API' && process.env.TRIVIAL_API_KEY) {
        const res =  await fetch(
          new URL(`/credential_sets/${id}/app`, process.env.LOG_TO_URL).href, {
          method: 'GET',
          headers: {
            'x-trivial-app-id': process.env.APP_ID,
            'content-type': 'application/json',
            'authorization': `Bearer ${process.env.APP_API_KEY}`
          },
        })
        const json = await res.json()
        this._credentialSets[id] = {
          data: json.credentials,
          loadedAt: Date.now()
        }
        return json.credentials
      }

      const key = `credentialSet/${id}`
      const response = await awsFetch('/', {
        service: 'secretsmanager',
        method: 'post',
        headers: {
          'X-Amz-Target': 'secretsmanager.GetSecretValue',
          'Content-Type': 'application/x-amz-json-1.1'
        },
        body: JSON.stringify({SecretId: key})
      })
      this.logger().debug({secretId: key, status: response.status, statusText: response.statusText}, '[CredentialManager][credentials] GetSecretValue')
      const body = await response.json()

      if (! response.ok) {
        throw new Error(`Failed to load credentials - ${body.Message}`)
      }

      this._credentialSets[id] = {
        data: JSON.parse(body.SecretString),
        loadedAt: Date.now()
      }
    }

    return this._credentialSets[id].data
  }

  static hasCachedCredentialSet(id) {
    return (
      this._credentialSets[id] &&
      (Date.now() - this._credentialSets[id].loadedAt < MAX_TTL)
    )
  }

  static get _credentialSets() {
    return (this.__credentialSets || (this.__credentialSets = {}))
  }

  static logger() {
    return logger
  }
}

module.exports = CredentialManager
