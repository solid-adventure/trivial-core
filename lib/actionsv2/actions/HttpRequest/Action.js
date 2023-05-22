const ActionBase = require('../../base/ActionBase')

class HttpRequest extends ActionBase {

  async perform() {
    const body = this.hasBody ? {body: this.body} : {}

    const res = await this.fetch(this.url, {
      method: this.method,
      headers: this.headers,
      ...body
    })

    this.setOutputValue({
      status: res.status,
      headers: res.headers,
      body: await this.readBody(res)
    })

    return true
  }

  get url() {
    return String(this.config.url || '')
  }

  get method() {
    return String(this.config.method || 'GET').toUpperCase()
  }

  get headers() {
    const headers = (this.config.headers || []).map(h => [h.name, h.value])
    const typeIdx = headers.findIndex(h => String(h[0]).trim().toLowerCase() === 'content-type')
    if (this.hasBody && typeIdx === -1) {
      headers.push(['content-type', 'application/json'])
    }
    return headers
  }

  get hasBody() {
    if (['GET', 'DELETE'].indexOf(this.method) !== -1) {
      return false
    } else {
      return this.inputValue !== undefined
    }
  }

  get contentType() {
    const head = this.headers.find(h => String(h[0]).trim().toLowerCase() === 'content-type')
    return head ? head[1] : undefined
  }

  get body() {
    const type = String(this.contentType || '').toLowerCase()

    if (type.indexOf('json') !== -1) {
      return JSON.stringify(this.inputValue)
    } else if (type.indexOf('form') !== -1) {
      return new URLSearchParams(this.inputValue)
    } else if (type.indexOf('text') !== -1) {
      return String(this.inputValue)
    } else {
      return this.inputValue instanceof Buffer ? this.inputValue : Buffer.from(String(this.inputValue))
    }
  }

  async readBody(res) {
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch (e) {
      return text
    }
  }
}

module.exports = HttpRequest
