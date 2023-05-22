const typeis = require('type-is')
const Accepts = require('accepts')

class ElbRequest {
  constructor(event) {
    this.event = event
    this.params = {}
    this._setUrl()
    this._readBody()
  }

  _setUrl() {
    const params = []
    Object.keys(this.event.queryStringParameters).forEach(param => {
      const val = this.event.queryStringParameters[param]
      params.push(`${encodeURIComponent(param)}=${encodeURIComponent(val)}`)
    })

    this.url = this.event.path
    if (params.length > 0) {
      this.url += `?${params.join('&')}`
    }
    this.originalUrl = this.url
  }

  _readBody() {
    if (this.event.isBase64Encoded) {
      this.rawBody = Buffer.from(this.event.body, 'base64').toString()
    } else {
      this.rawBody = this.event.body
    }

    if (this.is('application/json')) {
      try {
        this.body = JSON.parse(this.rawBody)
      } catch (e) {
        console.warn({err: e}, 'failed to parse request body')
      }
    }
  }

  get _accept() {
    return this._acceptsInstance = this._acceptsInstance || new Accepts(this)
  }

  get headers() {
    return this.event.headers
  }

  get hostname() {
    return this.get('host')
  }

  get host() {
    return this.hostname
  }

  get ip() {
    const ips = this.ips
    return ips ? ips[0] : undefined
  }

  get ips() {
    return this.get('x-forwarded-for').split('\s*,\s*')
  }

  get method() {
    return this.event.httpMethod
  }

  get path() {
    return this.event.path
  }

  get protocol() {
    return this.get('x-forwarded-proto')
  }

  get query() {
    return this.event.queryStringParameters
  }

  get secure() {
    return 'https' === this.protocol
  }

  get xhr() {
    return 'XMLHttpRequest' === this.get('x-requested-with')
  }

  accepts(...mimeTypes) {
    return this._accept.types(...mimeTypes)
  }

  acceptsCharsets(...charsets) {
    return this._accept.charsets(...charsets)
  }

  acceptsEncodings(...encodings) {
    return this._accept.encodings(...encodings)
  }

  acceptsLanguages(...languages) {
    return this._accept.languages(...languages)
  }

  get(headerName) {
    return this.event.headers[String(headerName || '').toLowerCase()]
  }

  getHeader(headerName) {
    return this.get(headerName)
  }

  is(mimeType) {
    return typeis.is(this.get('content-type'), [mimeType])
  }
}

module.exports = ElbRequest
