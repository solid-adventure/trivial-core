// Note the local inheritance
const ActionBase = require('../ActionBase')

class Generic extends ActionBase {

  async perform() {

    let path = this.inputValue.path
    let method = this.inputValue.method
    let url = new URL(`${this.baseURL}${path}`)

    let params = this.inputValue
    delete params.path
    delete params.method
    for (let key of Object.keys(params)) {
      url.searchParams.set(key, params[key])
    }

    const res = await this.fetchWithAuth(
      url.href,
      {
        method: method,
        headers: {'content-type': 'application/json'}
      }
    )

    this.setOutputValue({
      status: res.status,
      headers: res.headers,
      body: await res.json()
    })

    return true
  }
}

module.exports = Generic
