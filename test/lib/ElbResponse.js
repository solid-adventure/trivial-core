const ElbResponse = require('../../lib/ElbResponse')
const { expect } = require('chai')

describe('ElbResponse', () => {
  const res = new ElbResponse()

  describe('.headersSent', () => {
    it('returns false if no body has been set', () => {
      expect(res.headersSent).to.be.false
    })

    it('returns true after .toJSON() has not been called', () => {
      res.toJSON()
      expect(res.headersSent).to.be.true
    })

    it('returns true after a body has been set', () => {
      res.sendStatus(200)
      expect(res.headersSent).to.be.true
    })
  })

  describe('.locals', () => {
    it('returns an empty object', () => {
      expect(res.locals).to.eql({})
    })
  })

  describe('.append()', () => {
    const res = new ElbResponse()
    before(() => res.append('Warning', '199 Miscellaneous Warning'))

    it('sets a header field', () => {
      expect(res.headers).to.eql({'warning': '199 Miscellaneous Warning'})
    })

    it('returns self', () => {
      expect(res.append('Warning', '199 Miscellaneous Warning')).to.eq(res)
    })
  })

  describe('.end()', () => {
    const res = new ElbResponse()
    it('returns self', () => {
      expect(res.end()).to.eq(res)
    })
  })

  describe('.get()', () => {
    const res = new ElbResponse()
    before(() => res.append('Content-Type', 'text/plain'))

    it('returns the value of the requested header (case insensitive)', () => {
      expect(res.get('content-type')).to.eql('text/plain')
    })
  })

  describe('.getHeader()', () => {
    const res = new ElbResponse()
    before(() => res.append('Content-Type', 'text/plain'))

    it('is an alias for .get()', () => {
      expect(res.getHeader('content-type')).to.eql('text/plain')
    })
  })

  describe('.getHeaderNames()', () => {
    const res = new ElbResponse()
    before(() => res.setHeader('Content-Type', 'text/plain'))

    it('returns an array of header names that have been set', () => {
      expect(res.getHeaderNames()).to.eql(['content-type'])
    })
  })

  describe('.getHeaders()', () => {
    const res = new ElbResponse()
    before(() => res.setHeader('Content-Type', 'text/plain'))

    it('returns an object containing all set headers', () => {
      expect(res.getHeaders()).to.eql({'content-type': 'text/plain'})
    })
  })

  describe('.hasHeader()', () => {
    const res = new ElbResponse()
    before(() => res.setHeader('Content-Type', 'text/plain'))

    it('returns true if the header has been set', () => {
      expect(res.hasHeader('Content-Type')).to.be.true
    })

    it('returns false if the header has not been set', () => {
      expect(res.hasHeader('Content-Length')).to.be.false
    })
  })

  describe('.header()', () => {
    const res = new ElbResponse()
    before(() => res.header('Content-Type', 'text/html'))

    it('is an alias for set', () => {
      expect(res.get('Content-Type')).to.eq('text/html')
    })
  })

  describe('.json()', () => {
    const res = new ElbResponse()
    const obj = {error: 'message'}
    before(() => res.json(obj))

    it('sets the content type', () => {
      expect(res.get('content-type')).to.eql('application/json')
    })

    it('sets the body', () => {
      expect(res.body).to.eq(obj)
    })

    it('returns self', () => {
      expect(res.json(obj)).to.eq(res)
    })
  })

  describe('.location()', () => {
    const res = new ElbResponse()
    before(() => res.location('http://example.test'))

    it('sets the location header', () => {
      expect(res.get('location')).to.eql('http://example.test')
    })

    it('returns self', () => {
      expect(res.location('http://example.test')).to.eq(res)
    })
  })

  describe('.redirect()', () => {
    const res = new ElbResponse()
    before(() => res.redirect('http://example.test'))

    it('sets the location header', () => {
      expect(res.get('location')).to.eql('http://example.test')
    })

    it('defaults the statusCode to 302', () => {
      expect(res.statusCode).to.eql(302)
    })

    it('accepts an alternate statusCode', () => {
      const res = new ElbResponse()
      res.redirect(301, 'https://example.test')
      expect(res.statusCode).to.eql(301)
      expect(res.get('location')).to.eql('https://example.test')
    })

    it('returns self', () => {
      expect(res.redirect('http://example.test')).to.eq(res)
    })
  })

  describe('.removeHeader()', () => {
    const res = new ElbResponse()
    before(() => res.setHeader('Content-Type', 'text/plain'))

    it('removes the named header', () => {
      res.removeHeader('Content-Type')
      expect(res.hasHeader('Content-Type')).to.be.false
    })
  })

  describe('.send()', () => {
    const res = new ElbResponse()
    const body = Buffer.from('Hello!')
    before(() => res.send(body))

    it('sets the body', () => {
      expect(res.body).to.eq(body)
    })

    it('returns self', () => {
      expect(res.send(body)).to.eq(res)
    })
  })

  describe('.sendStatus()', () => {
    const res = new ElbResponse()
    before(() => res.sendStatus(500))

    it('sets the statusCode', () => {
      expect(res.statusCode).to.eq(500)
    })

    it('sets the body to the default status message', () => {
      expect(res.body).to.eq('Internal Server Error')
    })

    it('returns self', () => {
      expect(res.sendStatus(500)).to.eq(res)
    })
  })

  describe('.set()', () => {
    const res = new ElbResponse()
    before(() => res.set('Content-Type', 'text/html'))

    it('sets the given header', () => {
      expect(res.get('Content-Type')).to.eq('text/html')
    })

    it('accepts an object with multiple headers', () => {
      const res = new ElbResponse()
      res.set({'Content-Type': 'text/html', 'X-Frame-Options': 'SAMEORIGIN'})
      expect(res.get('Content-Type')).to.eq('text/html')
      expect(res.get('X-Frame-Options')).to.eq('SAMEORIGIN')
    })

    it('returns self', () => {
      expect(res.set('Content-Type', 'text/html')).to.eq(res)
    })
  })

  describe('.status()', () => {
    const res = new ElbResponse()
    before(() => res.status(404))

    it('sets the statusCode', () => {
      expect(res.statusCode).to.eq(404)
    })

    it('returns self', () => {
      expect(res.status(404)).to.eq(res)
    })
  })

  describe('.toJSON()', () => {
    const res = new ElbResponse()
    res.send({error: 'message'})

    it('returns a representation of this response in JSON', () => {
      expect(res.toJSON()).to.eql({
        statusCode: 200,
        statusDescription: "200 OK",
        isBase64Encoded: false,
        headers: {
          'content-type': 'application/json'
        },
        body: '{"error":"message"}'
      })
    })

    context('when a buffer is sent', () => {
      const res = new ElbResponse()
      res.send(Buffer.from('message'))

      it('base64 encodes the body', () => {
        expect(res.toJSON()).to.eql({
          statusCode: 200,
          statusDescription: "200 OK",
          isBase64Encoded: true,
          headers: {
            'content-type': 'application/octet-stream'
          },
          body: 'bWVzc2FnZQ=='
        })
      })
    })
  })

})
