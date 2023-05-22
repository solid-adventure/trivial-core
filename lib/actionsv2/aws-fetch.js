const fetch = require('node-fetch')
const crypto = require('crypto')

/**
 * Wraps fetch with AWS version 4 signature. Credentials are obtained
 * from the environment variables AWS_ACCESS_KEY_ID and
 * AWS_SECRET_ACCESS_KEY. AWS_REGION can be used to specify the
 * region.
 *
 * This utility is intended for use by a deployed lambda. The four
 * environment variables it checks to produce the signature are set
 * automatically by AWS when a lambda is invoked.
 *
 * Supports the following additional options:
 *  - service: The AWS service code for the service
 *  - region: The AWS region name, defaults to AWS_REGION from the environment
 *  - fetch: The underlying fetch implementation to use
 *
 * If the `service` option is provided, it will be used to construct
 * the complete URL, allowing you to make requests like:
 *
 *   awsFetch('/', {
 *     service: 'secretsmanager',
 *     method: 'post',
 *     headers: {
 *       'X-Amz-Target': 'secretsmanager.GetSecretValue',
 *       'Content-Type': 'application/x-amz-json-1.1'
 *     },
 *     body: JSON.stringify({
 *       SecretId: "MyTestDatabaseSecret"
 *     })
 *   })
 *
 * If AWS_SESSION_TOKEN is set in the environment, its value is
 * included automatically in an X-Amz-Security-Token header.
 */
async function awsFetch(url, options) {
  const req = new AWSRequest(url, options)
  return req.send()
}

module.exports = awsFetch

class AWSRequest {
  constructor(url, options) {
    this.options = Object.assign({
      method: 'get',
      region: process.env.AWS_REGION,
      headers: {}
    }, options)

    if (this.options.service) {
      this.url = new URL(url, this._baseUrl(this.options)).href
    } else {
      this.url = url
    }
  }

  _baseUrl(options) {
    if (this._isRegionlessService(options.service)) {
      return `https://${options.service}.amazonaws.com`
    } else  if (! options.region) {
      throw new Error('The AWS region must be specified with the region option or by setting the AWS_REGION environment variable')
    }

    return `https://${options.service}.${options.region}.amazonaws.com`
  }

  _isRegionlessService(name) {
    return [
      'budgets',
      'cloudfront',
      'globalaccelerator',
      'iam',
      'importexport',
      'route53',
      'savingsplans',
      'service.chime',
      'waf'
    ].indexOf(name) !== -1
  }

  get _escapePath() {
    return this.service !== 's3'
  }

  get service() {
    if (this.options.service) {
      return this.options.service
    } else {
      const url = new URL(this.url)
      const match = /^([^.]+)/.exec(url.hostname)
      return match ? match[1] : undefined
    }
  }

  get region() {
    if (this.options.region) {
      return this.options.region
    } else if (process.env.AWS_REGION) {
      return process.env.AWS_REGION
    } else {
      const url = new URL(this.url)
      const match = /^[^.]+\.([^.]+)/.exec(url.hostname)
      return match ? match[1] : undefined
    }
  }

  get payload() {
    return (this.options.body || '').toString()
  }

  get accessKey() {
    if (! process.env.AWS_ACCESS_KEY_ID)
      throw new Error('The AWS_ACCESS_KEY_ID environment variable is not set')

    return process.env.AWS_ACCESS_KEY_ID
  }

  get secretKey() {
    if (! process.env.AWS_SECRET_ACCESS_KEY)
      throw new Error('The AWS_SECRET_ACCESS_KEY environment variable is not set')

    return process.env.AWS_SECRET_ACCESS_KEY
  }

  get requestDate() {
    return (this._requestDateTime || '').substring(0, 8)
  }

  get credentialScope() {
    return `${this.requestDate}/${this.region}/${this.service}/aws4_request`
  }

  get fetchOptions() {
    return Object.fromEntries(
      [...Object.entries(this.options)]
      .filter(entry => -1 === ['service', 'region', 'fetch'].indexOf(entry[0]))
    )
  }

  async send() {
    this._includeTokenIfPresent()
    this._injectDate()
    this._signRequest()
    return (this.options.fetch || fetch)(this.url, this.fetchOptions)
  }

  // AWS requires percent encoding of characters not normally encoded by encodeURIComponent
  awsEscape(value) {
    function pctEncode(char) {
      return `%${char.charCodeAt(0).toString(16).toUpperCase()}`
    }

    return encodeURIComponent(value).replace(/[!'()*]/g, pctEncode)
  }

  _includeTokenIfPresent() {
    if (process.env.AWS_SESSION_TOKEN) {
      this._setHeader('X-Amz-Security-Token', process.env.AWS_SESSION_TOKEN)
    }
  }

  _injectDate() {
    this._requestDateTime = this._isoBasic(new Date())
    this._setHeader('x-amz-date', this._requestDateTime)
  }

  _setHeader(name, value) {
    if ('function' === typeof this.options.headers.set) {
      this.options.headers.set(name, value)
    } else {
      this.options.headers[name] = value
    }
  }

  _isoBasic(dte) {
    const month = dte.getUTCMonth() + 1
    const day = dte.getUTCDate()
    const hours = dte.getUTCHours()
    const minutes = dte.getUTCMinutes()
    const secs = dte.getUTCSeconds()

    return dte.getUTCFullYear() +
      (month < 10 ? `0${month}` : `${month}`) +
      (day < 10 ? `0${day}` : `${day}`) +
      (hours < 10 ? `T0${hours}` : `T${hours}`) +
      (minutes < 10 ? `0${minutes}` : `${minutes}`) +
      (secs < 10 ? `0${secs}Z` : `${secs}Z`)
  }

  _signRequest() {
    const sig = this._signature()

    this._setHeader(
      'Authorization',
      `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${this.credentialScope}, SignedHeaders=${this._signedHeaderNames.join(';')}, Signature=${sig}`
    )
  }

  _signature() {
    return this._hmac(
      this._signingKey(),
      this._signingString()
    ).toString('hex')
  }

  _signingKey() {
    const kDate = this._hmac(`AWS4${this.secretKey}`, this.requestDate)
    const kRegion = this._hmac(kDate, this.region)
    const kService = this._hmac(kRegion, this.service)
    return this._hmac(kService, 'aws4_request')
  }

  _signingString() {
    return [
      'AWS4-HMAC-SHA256',
      this._requestDateTime,
      this.credentialScope,
      this._hash(this._canonicalRequest())
    ].join("\n")
  }

  _canonicalRequest() {
    return [
      this._requestMethod(),
      this._canonicalURI(),
      this._canonicalQueryString(),
      this._canonicalHeaders(),
      this._signedHeaderNames.join(';'),
      this._payloadHash()
    ].join("\n")
  }

  _requestMethod() {
    return String(this.options.method || 'get').toUpperCase()
  }

  _canonicalURI() {
    const url = new URL(this.url)
    if (this._escapePath) {
      return encodeURIComponent(url.pathname).replace(/%2F/gi, '/')
    } else {
      return url.path
    }
  }

  _canonicalQueryString() {
    const url = new URL(this.url)
    const pairs = [...url.searchParams].sort()
    return pairs
      .map(item => `${this.awsEscape(item[0])}=${this.awsEscape(item[1])}`)
      .join('&')
  }

  _canonicalHeaders() {
    const headers = this.options.headers
    const source = headers[Symbol.iterator] ? headers : Object.entries(headers)
    const pairs = [...source]
      .map(item => [
        String(item[0]).toLowerCase(),
        String(item[1]).trim().replace(/\s+/g, '')
      ])

    if (undefined === pairs.find(item => 'host' === item[0])) {
      pairs.push(['host', new URL(this.url).hostname])
    }

    const uniquePairs = []
    for (let item of pairs) {
      const existing = uniquePairs.find(u => u[0] === item[1])
      if (existing && Array.isArray(existing[1])) {
        existing[1].push(item[1])
      } else if (existing) {
        existing[1] = [existing[1], item[1]]
      } else {
        uniquePairs.push(item)
      }
    }

    uniquePairs.sort()

    this._signedHeaderNames = uniquePairs.map(item => item[0])

    return uniquePairs.map(item => {
      if (Array.isArray(item[1])) {
        return `${item[0]}:${item[1].join(',')}\n`
      } else {
        return `${item[0]}:${item[1]}\n`
      }
    }).join('')
  }

  _hash(value) {
    const hash = crypto.createHash('sha256')
    hash.update(value)
    return hash.digest('hex')
  }

  _hmac(key, value) {
    const hmac = crypto.createHmac('sha256', key)
    hmac.update(value)
    return hmac.digest()
  }

  _payloadHash() {
    return this._hash(this.payload)
  }
}
