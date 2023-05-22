const { expect } = require('chai')
const InitializerGenerator = require('../../../lib/generatorv2/InitializerGenerator')
const BuiltinActionGenerator = require('../../../lib/generatorv2/BuiltinActionGenerator')

describe('InitializerGenerator', () => {

  let instantiated = [
    new BuiltinActionGenerator('PostSlackMessage', {type: 'PostSlackMessage'}),
    new BuiltinActionGenerator('CreateShopWareCustomer', {type: 'CreateShopWareCustomer'})
  ]
  let generator = new InitializerGenerator(instantiated)

  describe('.definition()', () => {
    it('returns a string', () => {
      expect(generator.definition()).to.be.a('string')
    })

    it('includes each action utilized', () => {
      expect(generator.definition()).to.match(
        /const PostSlackMessage = require\("\.\/lib\/actionsv2\/actions\/PostSlackMessage\/Action"\)/
      )
      expect(generator.definition()).to.match(
        /const CreateShopWareCustomer = require\("\.\/lib\/actionsv2\/actions\/CreateShopWareCustomer\/Action"\)/
      )
    })

    it('adds redactions for each action utilized', () => {
      expect(generator.definition()).to.match(
        /Redactions\.addActionPaths\(PostSlackMessage\)/
      )
      expect(generator.definition()).to.match(
        /Redactions\.addActionPaths\(CreateShopWareCustomer\)/
      )
    })

    context('when feature settings are present', () => {
      let settings = {'feature_one': true, 'feature_two': false}
      let generator = new InitializerGenerator(instantiated, settings)

      it('initializes the feature manager with the settings', () => {
        expect(generator.definition()).to.match(
          /FeatureManager\.init\(\{\s*"feature_one":\s*true,\s*"feature_two":\s*false\s*\}\)/
        )
      })
    })
  })

})
