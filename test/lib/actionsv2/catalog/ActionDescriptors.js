const { expect } = require('chai')

const ActionWithTransform = require('../../../../lib/actionsv2/actions/ActionWithTransform/Descriptor')
const FeatureManager = require('../../../../lib/FeatureManager')

// requires the equivalent of 'gulp genAvailableActions' having been run - not yet sure of workflow here
describe('ActionDescriptors', () => {


  describe('.descriptorClasses', () => {

    const ActionDescriptors = require('../../../../lib/actionsv2/catalog/ActionDescriptors')
    const fs = require('fs')
    const path = require('path')

    const actionsRoot = path.resolve(__dirname, '../../../../lib/actionsv2/actions')
    const actionsDirs = fs.readdirSync(actionsRoot, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name)

    context('canned actions', () =>  {

      actionsDirs.forEach(element => {
        // Google is validated below
        if (element === "Google") { return }
        it('includes ' + element, () => {
            expect(ActionDescriptors.descriptorClasses).to.include.keys(element)
        })
      })
    })  

    // context('with GOOGLE_ACTION feature setting not enabled per default', () =>  {

    //   it('does not include Google action', () => {
    //       expect(ActionDescriptors.descriptorClasses).to.not.include.keys('Google')
    //   })
    // })
    
    // context('with GOOGLE_ACTION feature setting enabled', () =>  {

    //   let settings;
    //   before(() => {
    //     settings = FeatureManager._settings
    //     FeatureManager.init({GOOGLE_ACTIONS: true})
    //   })
    //   after(() => { FeatureManager._settings = settings })

    //   it('includes Google action', () => {
    //       expect(ActionDescriptors.descriptorClasses).to.include.keys('Google')
    //   })

    // })

  })

})
