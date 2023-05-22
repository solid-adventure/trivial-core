const ElbRequest = require('../../lib/ElbRequest')
const { expect } = require('chai')

describe('ElbRequest', () => {

  const event = {
    requestContext: { elb: {} },
    httpMethod: 'POST',
    path: '/webhooks/receive',
    queryStringParameters: {x: 1, y: 2},
    headers: {
      accept: '*/*',
      'content-length': '13',
      'content-type': 'application/json',
      host: 'test-lb-1990480126.us-east-2.elb.amazonaws.com',
      'user-agent': 'curl/7.64.1',
      'x-amzn-trace-id': 'Root=1-611eac99-50055f620f8e24a44791cd50',
      'x-forwarded-for': '192.168.0.1',
      'x-forwarded-port': '80',
      'x-forwarded-proto': 'http'
    },
    body: '{"bar":"baz"}',
    isBase64Encoded: false
  }
  const req = new ElbRequest(event)

  describe('.event', () => {
    it('returns the original event', () => {
      expect(req.event).to.eq(event)
    })
  })

  describe('.rawBody', () => {
    it('returns the unparsed body', () => {
      expect(req.rawBody).to.eql(event.body)
    })

    context('when the body is base64 encoded', () => {
      let req = new ElbRequest(Object.assign({}, event, {
        body: Buffer.from(event.body).toString('base64'),
        isBase64Encoded: true
      }))

      it('returns the decoded body', () => {
        expect(req.rawBody).to.eql(event.body)
      })
    })
  })

  describe('.body', () => {
    it('returns the parsed body', () => {
      expect(req.body).to.eql({bar: 'baz'})
    })
  })

  describe('.headers', () => {
    it('returns the request headers', () => {
      expect(req.headers).to.eql(event.headers)
    })
  })

  describe('.hostname', () => {
    it('returns the host name used in the request', () => {
      expect(req.hostname).to.eql(event.headers.host)
    })
  })

  describe('.host', () => {
    it('is an alias for hostname', () => {
      expect(req.host).to.eql(req.hostname)
    })
  })

  describe('.ips', () => {
    it('returns the left-most forwarded ip', () => {
      expect(req.ip).to.eql('192.168.0.1')
    })
  })

  describe('.ips', () => {
    it('returns the list of forwarded ips', () => {
      expect(req.ips).to.eql(['192.168.0.1'])
    })
  })

  describe('.method', () => {
    it('returns request method', () => {
      expect(req.method).to.eql('POST')
    })
  })

  describe('.originalUrl', () => {
    it('contains a copy of url', () => {
      expect(req.originalUrl).to.eql(req.url)
    })
  })

  describe('.params', () => {
    it('returns an empty object', () => {
      expect(req.params).to.eql({})
    })
  })

  describe('.path', () => {
    it('returns the path part of the URL', () => {
      expect(req.path).to.eql('/webhooks/receive')
    })
  })

  describe('.protocol', () => {
    it('returns the protocol of the forwarded connection', () => {
      expect(req.protocol).to.eql('http')
    })
  })

  describe('.query', () => {
    it('returns the parsed parameters from the query string', () => {
      expect(req.query).to.eql({x: 1, y: 2})
    })
  })

  describe('.secure', () => {
    it('returns true if the protocol is https', () => {
      let req = new ElbRequest(Object.assign({}, event, {
        headers: Object.assign({}, event.headers, {'x-forwarded-proto': 'https'})
      }))
      expect(req.secure).to.be.true
    })

    it('returns false otherwise', () => {
      expect(req.secure).to.be.false
    })
  })

  describe('.xhr', () => {
    it('returns true if the x-requested-with header is XMLHttpRequest', () => {
      let req = new ElbRequest(Object.assign({}, event, {
        headers: Object.assign({}, event.headers, {'x-requested-with': 'XMLHttpRequest'})
      }))
      expect(req.xhr).to.be.true
    })

    it('returns false otherwise', () => {
      expect(req.xhr).to.be.false
    })
  })

  describe('.url', () => {
    it('returns the path with parameters', () => {
      expect(req.url).to.eql('/webhooks/receive?x=1&y=2')
    })
  })

  describe('.accepts()', () => {
    it('returns the mime type if the client can accept the given mime type', () => {
      expect(req.accepts('application/json')).to.eql('application/json')
    })

    it('returns the first acceptable type when multiple are given', () => {
      expect(req.accepts(['html', 'json'])).to.eql('html')
    })

    it('returns false otherwise', () => {
      let req = new ElbRequest(Object.assign({}, event, {
        headers: Object.assign({}, event.headers, {'accept': 'text/html'})
      }))
      expect(req.accepts('application/json')).to.be.false
    })
  })

  describe('.acceptsCharsets()', () => {
    it('returns the charset if the client accepts it', () => {
      expect(req.acceptsCharsets('utf-8')).to.eql('utf-8')
    })

    it('returns the first acceptable charset when multiple are given', () => {
      expect(req.acceptsCharsets(['iso-8859-1', 'utf-8'])).to.eql('iso-8859-1')
    })

    it('returns false otherwise', () => {
      let req = new ElbRequest(Object.assign({}, event, {
        headers: Object.assign({}, event.headers, {'accept-charset': 'utf-7'})
      }))
      expect(req.acceptsCharsets('utf-8')).to.be.false
    })
  })

  describe('.acceptsEncodings()', () => {
    it('returns the encoding if the client accepts it', () => {
      let req = new ElbRequest(Object.assign({}, event, {
        headers: Object.assign({}, event.headers, {'accept-encoding': 'gzip'})
      }))
      expect(req.acceptsEncodings('gzip')).to.eql('gzip')
    })

    it('returns the first acceptable encoding when multiple are given', () => {
      let req = new ElbRequest(Object.assign({}, event, {
        headers: Object.assign({}, event.headers, {'accept-encoding': 'deflate'})
      }))
      expect(req.acceptsEncodings('gzip', 'deflate')).to.eql('deflate')
    })

    it('returns false otherwise', () => {
      expect(req.acceptsEncodings('gzip')).to.be.false
    })
  })

  describe('.acceptsLanguages()', () => {
    it('returns the language if the client accepts it', () => {
      expect(req.acceptsLanguages('en')).to.eql('en')
    })

    it('returns the first acceptable language when multiple are given', () => {
      expect(req.acceptsLanguages(['en', 'es'])).to.eql('en')
    })

    it('returns false otherwise', () => {
      let req = new ElbRequest(Object.assign({}, event, {
        headers: Object.assign({}, event.headers, {'accept-language': 'es'})
      }))
      expect(req.acceptsLanguages('en')).to.be.false
    })
  })

  describe('.get()', () => {
    it('returns the value of the requested header', () => {
      expect(req.get('content-type')).to.eql('application/json')
    })

    it('is case insensitive', () => {
      expect(req.get('Content-Type')).to.eql('application/json')
    })
  })

  describe('.getHeader()', () => {
    it('is an alias for get', () => {
      expect(req.getHeader('Content-Type')).to.eql('application/json')
    })
  })

  describe('.is()', () => {
    it('returns the content type if the request is of this type', () => {
      expect(req.is('application/json')).to.eql('application/json')
    })

    it('returns false for a different type', () => {
      expect(req.is('text/html')).to.be.false
    })
  })

})
