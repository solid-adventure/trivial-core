const STATUS_CODES = require('http').STATUS_CODES

function isString(val) { return 'string' === typeof val || val instanceof String }
function isBuffer(val) { return val instanceof Buffer }

class ElbResponse {
  constructor() {
    this.sent = false
    this.headers = {}
    this.locals = {}
  }

  get headersSent() {
    return this.sent || undefined !== this.body
  }

  append(name, value) {
    this.setHeader(name, value)
    return this
  }

  end() {
    return this
  }

  get(headerName) {
    return this.headers[String(headerName || '').toLowerCase()]
  }

  getHeader(headerName) {
    return this.get(headerName)
  }

  getHeaderNames() {
    return Object.keys(this.headers)
  }

  getHeaders() {
    return this.headers
  }

  hasHeader(name) {
    return this.headers.hasOwnProperty(String(name || '').toLowerCase())
  }

  header(...pairs) {
    return this.set(...pairs)
  }

  json(body) {
    this.setHeader('content-type', 'application/json')
    this.send(body)
    return this
  }

  location(path) {
    this.setHeader('location', path)
    return this
  }

  redirect(status, path) {
    if (undefined === path) {
      path = status
      status = 302
    }
    this.location(path)
    this.status(status)
    return this
  }

  removeHeader(name) {
    delete this.headers[String(name || '').toLowerCase()]
  }

  send(body) {
    this.body = body
    return this
  }

  sendStatus(code) {
    this.status(code)
    this.send(STATUS_CODES[code] || `${code}`)
    return this
  }

  set(name, value) {
    if (isString(name)) {
      this.setHeader(name, value)
    } else {
      Object.keys(name).forEach(key => this.setHeader(key, name[key]))
    }
    return this
  }

  setHeader(name, value) {
    this.headers[String(name || '').toLowerCase()] = `${value}`
  }

  status(code) {
    this.statusCode = code
    return this
  }

  toJSON() {
    const statusCode = this.statusCode || 200
    const statusDescription = this.statusMessage || `${statusCode} ${STATUS_CODES[statusCode]}`
    let body = this.body
    let isBase64Encoded = false

    if (isString(body)) {
      if (! this.hasHeader('content-type'))
        this.setHeader('content-type', 'text/plain')
    } else if (isBuffer(body)) {
      if (! this.hasHeader('content-type'))
        this.setHeader('content-type', 'application/octet-stream')
      body = body.toString('base64')
      isBase64Encoded = true
    } else {
      if (! this.hasHeader('content-type'))
        this.setHeader('content-type', 'application/json')
      body = JSON.stringify(body)
    }

    const headers = this.headers

    this.sent = true

    return {
      statusCode,
      statusDescription,
      headers,
      isBase64Encoded,
      body
    }
  }
}

module.exports = ElbResponse
