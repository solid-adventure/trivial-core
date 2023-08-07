const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

// Use should style assertions.
chai.should();

// Mock dependencies.
const awsFetchStub = sinon.stub();
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
  })

  afterEach(() => {
    // Restore original fetch function
    sinon.restore()
    awsFetchStub.reset();
    fetchStub.reset();
  })

  describe('#resolveCredentials', function() {
    it('should resolve credentials correctly', async function() {
      const testConfig = { api: { $ref: ['demo', 'test'] } };
      awsFetchStub.resolves({ SecretString: JSON.stringify({ demo: { test: '123' } }) });
      const result = await CredentialManager.resolveCredentials(testConfig);
      result.should.have.property('api', '123');
    });
  });

  it('should resolveCredentials resolves references correctly', async () => {
    // Mock the credentials response
    const mockCredentials = {
      section1: {
        item1: 'value1',
        item2: 'value2'
      },
      section2: {
        item3: 'value3'
      }
    }
    CredentialManager.credentials = sinon.stub().resolves(mockCredentials)

    // Test input and expected output
    const config = {
      field1: {
        $ref: ['section1', 'item1']
      },
      field2: {
        $ref: ['section1', 'item2']
      },
      field3: {
        $ref: ['section2', 'item3']
      }
    }
    const expectedOutput = {
      field1: 'value1',
      field2: 'value2',
      field3: 'value3'
    }

    // Call the method being tested
    const result = await CredentialManager.resolveCredentials(config)

    // Verify the result
    expect(result).to.deep.equal(expectedOutput)
    expect(CredentialManager.credentials).to.have.been.calledOnce
  })

  it('should resolveCredentials resolves credential sets correctly', async () => {
    // Mock the credential set response
    const mockCredentialSet = {
      data: {
        username: 'username',
        password: 'password'
      }
    }
    CredentialManager.credentialSet = sinon.stub().resolves(mockCredentialSet)

    // Test input and expected output
    const config = {
      field1: {
        $cred: 'credentialSetId1'
      },
      field2: {
        $cred: 'credentialSetId2'
      }
    }
    const expectedOutput = {
      field1: mockCredentialSet.data,
      field2: mockCredentialSet.data
    }

    // Call the method being tested
    const result = await CredentialManager.resolveCredentials(config)

    // Verify the result
    expect(result).to.deep.equal(expectedOutput)
    expect(CredentialManager.credentialSet).to.have.been.calledTwice
    expect(CredentialManager.credentialSet).to.have.been.calledWith('credentialSetId1')
    expect(CredentialManager.credentialSet).to.have.been.calledWith('credentialSetId2')
  })

  it('should resolveCredentials resolves environment variables correctly', async () => {
    // Mock the environment variables
    process.env.SECRET_VALUE = 'secret'

    // Test input and expected output
    const config = {
      field1: {
        $env: 'SECRET_VALUE'
      },
      field2: {
        $env: 'NON_EXISTING_VARIABLE'
      }
    }
    const expectedOutput = {
      field1: 'secret',
      field2: undefined
    }

    // Call the method being tested
    const result = await CredentialManager.resolveCredentials(config)

    // Verify the result
    expect(result).to.deep.equal(expectedOutput)
  })

  it('should resolveCredentials returns input values if not a reference, credential set, or environment variable', async () => {
    // Test input and expected output
    const config = {
      field1: 'value1',
      field2: null,
      field3: 123
    }
    const expectedOutput = {
      field1: 'value1',
      field2: null,
      field3: 123
    }

    // Call the method being tested
    const result = await CredentialManager.resolveCredentials(config)

    // Verify the result
    expect(result).to.deep.equal(expectedOutput)
  })

  // Add more tests for other methods and scenarios if needed
})
