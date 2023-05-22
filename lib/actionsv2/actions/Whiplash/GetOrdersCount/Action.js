// Note the local inheritance
const ActionBase = require('../ActionBase')

class GetOrdersCount extends ActionBase {

  async perform() {

    let path = '/orders/count'

    let url = new URL(`${this.baseURL}${path}`)
    if (this.inputValue.search) {
      url.searchParams.set('search', this.inputValue.search)
    }

    const res = await this.fetchWithAuth(
      url.href,
      {
        method: 'GET',
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

module.exports = GetOrdersCount
