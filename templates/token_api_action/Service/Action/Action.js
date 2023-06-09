const ActionBase = require('../../../base/ActionBase')

class {{NewAction}} extends ActionBase {
  async perform() {

    // let api_key = this.config.{{serviceName}}.api_key
    const res = await this.fetch( this.url,
      {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(this.inputValue)
      }
    )

    this.setHTTPResponseOutput(res, await res.json())

    return true
  }

  get url() {
    return 'https://www.new-service-api.com'
  }

  static get redactPaths() {
    return ['*.headers["x-access-token"]'];
  }

}

module.exports = {{NewAction}}
