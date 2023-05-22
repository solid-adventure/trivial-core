const ActionBase = require('../../../base/ActionBase')

class Generic extends ActionBase {

  async perform() {

    let url = new URL(`${this.inputValue.baseURL}${this.inputValue.path}`)
    let config = {
      method: this.inputValue.method,
      headers: {
        'content-type': 'application/json',
        'X-API-KEY': `${this.config.arka.api_key}`
      }
    }
    if (this.inputValue.searchParams) {
        for (let key of Object.keys(this.inputValue.searchParams)) {
            url.searchParams.set(key, this.inputValue.searchParams[key])
        }
    }
    if (this.inputValue.body) config.body = JSON.stringify(this.inputValue.body)

    const res = await this.fetch(
      url.href,
      config
    )

    this.setOutputValue({
      status: res.status,
      headers: res.headers,
      body: await res.json()
    })

    return true
  }

  static get redactPaths() {
    return ['*.headers["X-API-KEY"]'];
  }
}

module.exports = Generic
