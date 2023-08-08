const chai = require('chai');
const { expect } = require('chai')
const sinon = require('sinon');
const fetch = require('node-fetch');
const awsFetch = require('../../lib/aws-fetch');
const proxyquire = require('proxyquire');

// Use should style assertions.
chai.should();

const awsFetchStub = () => {
    return Promise.resolve({status: 200, statusText: 'test', ok: true, json: () => Promise.resolve({SecretString: '\"AWS_fetchedCreds\"'})})
};
const fetchStub = sinon.stub();
const pinoStub = sinon.stub().returns({ level: 'debug', debug: sinon.stub(), info: sinon.stub(), error: sinon.stub() });

// Proxyquire to the rescue.
const CredentialManager = proxyquire('../../lib/CredentialManager', {
  './aws-fetch': awsFetchStub,
  'node-fetch': fetchStub,
  'pino': pinoStub
});

describe('CredentialManager', () => {

  beforeEach(() => {
    // Reset mock function before each test
    sinon.resetHistory()
    process.env.AWS_REGION = 'test'
    process.env.AWS_ACCESS_KEY_ID = 'test_key'
    process.env.AWS_SECRET_ACCESS_KEY = 'test_secret'
  })

  afterEach(() => {
    // Restore original fetch function
    sinon.restore()
  })


  describe('getByReference', function() {
    it('should return the reference', async function() {
      const ref = {$ref: ['name', 'item']}
      const stub = sinon.stub(CredentialManager, 'get').returns(Promise.resolve('test'));
      const result = await CredentialManager.getByReference(ref);
      expect(stub.calledOnceWith('name', 'item')).to.be.true;
      expect(result).to.equal('test');
    });
  });

  describe('getFromEnv', function() {
    it('should return the environment variable', function() {
      process.env.TEST_ENV = 'test';
      const ref = {$env: 'TEST_ENV'};
      const result = CredentialManager.getFromEnv(ref);
      expect(result).to.equal('test');
    });
  });

  describe('getCredentialSet', function() {
    it('should fetch credentials from a valid set', async function() {
      const ref = {$cred: '123'};
      const stub = sinon.stub(CredentialManager, 'credentialSet').returns(Promise.resolve('test'));
      const result = await CredentialManager.getCredentialSet(ref);
      expect(stub.calledOnceWith('123')).to.be.true;
      expect(result).to.equal('test');
    });
  });

  describe('credentials', function() {
    it('should fetch credentials from the service', async function() {
      const result = await CredentialManager.credentials();
      expect(result).to.equal('AWS_fetchedCreds');
    });

    it('should fetch credentials from AWS Secret Manager if CREDENTIALS_SERVICE is not set', async function() {
      process.env.CREDENTIALS_SERVICE = 'OTHER-SERVICE';
      process.env.AWS_REGION = 'test'
      const result = await CredentialManager.credentials();
      console.log(result)
      expect(result).to.equal('AWS_fetchedCreds');
    });
  });
})
