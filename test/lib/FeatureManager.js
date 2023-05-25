const { expect } = require('chai')
const FeatureManager = require('../../lib/FeatureManager')
const ElbRequest = require('../../lib/ElbRequest')

describe('FeatureManager', () => {

  describe('::featureKey()', () => {
    it('converts a camel case name to a lower case underscore name', () => {
      expect(FeatureManager.featureKey('camelCase')).to.eql('camel_case')
    })

    it('permits capitalized acronyms', () => {
      expect(FeatureManager.featureKey('camelABCCase')).to.eql('camel_abc_case')
    })

    it('permits numbers', () => {
      expect(FeatureManager.featureKey('camelABC123Case')).to.eql('camel_abc123_case')
    })

    it('converts a dash separated name to a lower case underscore name', () => {
      expect(FeatureManager.featureKey('kebab-case')).to.eql('kebab_case')
    })

    it('converts a human-readable name to a lower case underscore name', () => {
      expect(FeatureManager.featureKey('Human Name')).to.eql('human_name')
    })
  })

  describe('::isEnabled()', () => {
    it('returns false by default', () => {
      expect(FeatureManager.isEnabled('unknownFeature')).to.be.false
    })

    context('server side', () => {
      before(() => setEnv('ENABLE_FEATURE_ONE', '1'))
      after(() => restoreEnv('ENABLE_FEATURE_ONE'))

      it('returns true if the corresponding environment variable has a value', () => {
        expect(FeatureManager.isEnabled('featureOne')).to.be.true
      })
    })

    context('in the browser', () => {
      before(() => setGlobal('window', {
        location: new URL('https://example.test?enableFeatures=featureOne,featureThree')
      }))
      after(() => restoreGlobal('window'))

      it('returns true if the flag is set in the enableFeatures parameter', () => {
        expect(FeatureManager.isEnabled('featureThree')).to.be.true
      })
    })

    context('in the browser when no flags are given', () => {
      before(() => delete FeatureManager._enabledBrowserFeaturesCache)
      before(() => setGlobal('window', {
        location: new URL('https://example.test')
      }))
      after(() => restoreGlobal('window'))

      it('returns false', () => {
        expect(FeatureManager.isEnabled('featureThree')).to.be.false
      })
    })
  })

  describe('::init()', () => {
    let settings;
    before(() => {
      settings = FeatureManager._settings
      FeatureManager.init({
        featureSetToOn: true,
        featureSetToOff: false,
        featureSetWithFunction: () => false
      })
    })
    after(() => { FeatureManager._settings = settings })

    it('allows a function to be turned on', () => {
      expect(FeatureManager.isEnabled('featureSetToOn')).to.be.true
    })

    it('allows a function to be turned off', () => {
      expect(FeatureManager.isEnabled('featureSetToOff')).to.be.false
    })

    it('allows a function to be controlled by a function', () => {
      expect(FeatureManager.isEnabled('featureSetWithFunction')).to.be.false
    })
  })

  describe('::requestSettings()', () => {
    let req = new ElbRequest({
      headers: {},
      path: '/',
      queryStringParameters: {
        enableFeatures: 'featureAlpha,featureBeta'
      }
    })

    it('returns a hash containing any settings from the request', () => {
      expect(FeatureManager.requestSettings(req)).to.include(
        {feature_alpha: true, feature_beta: true}
      )
    })

    context('when settings are present from init', () => {
      let settings;
      before(() => {
        settings = FeatureManager._settings
        FeatureManager.init({featureBeta: false, featureGamma: false})
      })
      after(() => { FeatureManager._settings = settings })

      it('merges request settings with them', () => {
        expect(FeatureManager.requestSettings(req)).to.include(
          {feature_alpha: true, feature_beta: true, feature_gamma: false}
        )
      })
    })

    context('when settings are present in the environment', () => {
      before(() => setEnv('ENABLE_FEATURE_GAMMA', '1'))
      after(() => restoreEnv('ENABLE_FEATURE_GAMMA'))

      it('merges request settings with them', () => {
        expect(FeatureManager.requestSettings(req)).to.include(
          {feature_alpha: true, feature_beta: true, feature_gamma: true}
        )
      })
    })
  })

  describe('::featureParams()', () => {
    context('with feature parameters present', () => {
      before(() => setGlobal('window', {
        location: new URL('https://example.test?enableFeatures=featureOne,featureThree')
      }))
      after(() => restoreGlobal('window'))

      it('carries forward feature parameters in the browser', () => {
        expect(FeatureManager.featureParams()).to.eql(
          'enableFeatures=feature_one%2Cfeature_three'
        )
      })
    })

    context('without feature parameters', () => {
      before(() => delete FeatureManager._enabledBrowserFeaturesCache)
      before(() => setGlobal('window', {
        location: new URL('https://example.test')
      }))
      after(() => restoreGlobal('window'))

      it('returns an empty string', () => {
        expect(FeatureManager.featureParams()).to.eql('')
      })
    })
  })

  describe('::envSettings', () => {
    before(() => setEnv('ENABLE_FEATURE_OMEGA', '1'))
    before(() => setEnv('ENABLE_FEATURE_PSI', '1'))
    after(() => restoreEnv('ENABLE_FEATURE_PSI'))
    after(() => restoreEnv('ENABLE_FEATURE_OMEGA'))

    it('returns a hash containing any settings from the request', () => {
      expect(FeatureManager.envSettings()).to.include(
        {feature_omega: true, feature_psi: true}
      )
    })

    context('when settings are present from init', () => {
      let settings;
      before(() => {
        settings = FeatureManager._settings
        FeatureManager.init({featureChi: false})
      })
      after(() => { FeatureManager._settings = settings })

      it('merges request settings with them', () => {
        expect(FeatureManager.envSettings()).to.include(
          {feature_omega: true, feature_psi: true, feature_chi: false}
        )
      })
    })
  })

})

const previousValues = {}

function setEnv(name, value) {
  previousValues.env = previousValues.env || {}
  previousValues.env = process.env[name]
  process.env[name] = value
}

function restoreEnv(name) {
  if (previousValues.env && previousValues.env.hasOwnProperty(name)) {
    process.env[name] = previousValues.env[name]
    delete previousValues.env[name]
  } else {
    delete process.env[name]
  }
}

function setGlobal(name, value) {
  previousValues.global = previousValues.global || {}
  previousValues.global = global[name]
  global[name] = value
}

function restoreGlobal(name) {
  if (previousValues.global && previousValues.global.hasOwnProperty(name)) {
    global[name] = previousValues.global[name]
    delete previousValues.global[name]
  } else {
    delete global[name]
  }
}
