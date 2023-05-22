// Note the local inheritance
const ActionBase = require('../ActionBase')

class GetOrders extends ActionBase {

  async perform() {

    // Add path components to the path
    let path = '/orders'
    path += this.inputValue.originatorId ? `/originator/${this.inputValue.originatorId}` : ''
    path += this.inputValue.id ? `/${this.inputValue.id}` : ''

    // Define the URL and path
    let url = new URL(`${this.baseURL}${path}`)

    // Strip path components and append the rest of the input as query params
    let params = this.inputValue
    delete params.id
    delete params.originatorId
    for (let key of Object.keys(params)) {
      url.searchParams.set(key, params[key])
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

module.exports = GetOrders
