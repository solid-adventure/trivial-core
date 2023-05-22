// Note the local inheritance
const ActionBase = require('../ActionBase')

class {{Action}} extends ActionBase {

  async perform() {
    const res = await this.fetchWithAuth(
      `https://wwww.this-actions-url`,
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
          values: this.inputValue
        })
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

module.exports = {{Action}}
