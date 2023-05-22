const APISpec = require('./APISpec')
const fetch = require('node-fetch')

class APIService {
  constructor(name, req) {
    this.name = name
    this.req = req
  }

  fetchJSON(path, options = {}) {
    const method = options.method || 'GET'
    delete options.method
    return this._serviceRequest(method, {path, ...options})
  }

  async _serviceRequest(method, opts) {
    const service = new APISpec(this.name)
    const serviceReq = service.createRequest(opts)
    serviceReq.method = method
    service.injectCredentials(this.req, serviceReq)
    return this._serviceFetch(serviceReq)
  }

  async _serviceFetch(reqArgs) {
    // this.req.log.debug({proxyRequest: this._sanitize(reqArgs)}, 'api request')
    const res = await fetch(...this._fetchArgs(reqArgs))
    // this.req.log.debug({proxyResponse: {status: res.status}}, 'api response')
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return await res.json()
  }

  _fetchArgs(reqArgs) {
    const url = reqArgs.url
    delete reqArgs.url
    delete reqArgs.json
    return [url, reqArgs]
  }

  _sanitize(args) {
    return Object.fromEntries(
      [...Object.entries(args)].filter(entry => {
        return 'body' !== entry[0]
      })
    )
  }
}

module.exports = APIService
