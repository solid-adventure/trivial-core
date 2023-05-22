const chai = require('chai')
const expect = chai.expect
const ApiKey = require('../../lib/ApiKey')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

describe('ApiKey', () => {
  let app = '12345'
  let exp = Math.floor(Date.now() / 1000) + 3600
  let keyOpts = {
    modulusLength: 2048,
    publicKeyEncoding: {type: 'pkcs1', format: 'pem'},
    privateKeyEncoding: {type: 'pkcs1', format: 'pem'}
  }
  let { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', keyOpts)
  let token = jwt.sign({app, exp}, privateKey, {algorithm: 'RS256'})
  let apiKey = new ApiKey(token, {key: publicKey})

  describe('.isValid()', () => {
    function isValid(token) { return new ApiKey(token, {key: publicKey}).isValid() }

    context('given a valid key', () => {
      it('returns true', () => {
        expect(isValid(token)).to.be.true
      })
    })

    context('given key with an invalid signature', () => {
      let keys2 = crypto.generateKeyPairSync('rsa', keyOpts)
      let token = jwt.sign({app, exp}, keys2.privateKey, {algorithm: 'RS256'})

      it('returns false', () => {
        expect(isValid(token)).to.be.false
      })
    })

    context('given key with no signature', () => {
      let token = jwt.sign({app, exp}, null, {algorithm: 'none'})

      it('returns false', () => {
        expect(isValid(token)).to.be.false
      })
    })

    context('given an expired key', () => {
      let token = jwt.sign({app}, privateKey, {algorithm: 'RS256', expiresIn: '-1h'})

      it('returns false', () => {
        expect(isValid(token)).to.be.false
      })

      context('when ignoreExpiration is true', () => {
        it('returns true', () => {
          expect(new ApiKey(token, {key: publicKey}).isValid(true)).to.be.true
        })
      })
    })
  })

  describe('.appId', () => {
    it('returns the app value from the payload', () => {
      expect(apiKey.appId).to.eql(app)
    })
  })

  describe('.expiration', () => {
    it('returns the exp value from the payload', () => {
      expect(apiKey.expiration).to.eql(exp)
    })
  })

  describe('.isExpired()', () => {
    let expired = jwt.sign({app}, privateKey, {algorithm: 'RS256', expiresIn: '-1h'})

    it('returns false if the key has not expired', () => {
      expect(apiKey.isExpired()).to.be.false
    })

    it('returns true if the key has expired', () => {
      expect(new ApiKey(expired, {key: publicKey}).isExpired()).to.be.true
    })
  })

  describe('.willExpire()', () => {
    it('returns false if the key will not expire in the given number of seconds', () => {
      expect(apiKey.willExpire(60)).to.be.false
    })

    it('returns true if the key will expire in the given number of seconds', () => {
      expect(apiKey.willExpire(3600)).to.be.true
    })
  })
})
