const { expect } = require('chai')
const EachGenerator = require('../../../lib/generatorv2/EachGenerator')
const ActionGenerator = require('../../../lib/generatorv2/ActionGenerator')
const GeneratorFactory = require('../../../lib/generatorv2/GeneratorFactory')

describe('EachGenerator', () => {

  let actionDef = {
          "identifier": "2",
          "enabled": true,
          "name": null,
          "inputName": null,
          "outputName": null,
          "type": "Each",
          "definition": {
            "list": "[1,2]",
            "item_name": "bloodhound",
            "actions": [
              {
                "identifier": "3",
                "enabled": true,
                "name": "SendResponse",
                "inputName": null,
                "outputName": null,
                "type": "ActionWithTransform",
                "definition": {
                  "actions": [
                    {
                      "identifier": "4",
                      "enabled": true,
                      "name": null,
                      "inputName": null,
                      "outputName": null,
                      "type": "Transform",
                      "definition": {
                        "from": "GenericObject",
                        "to": "HTTPResponse",
                        "transformations": [
                          {
                            "from": "{item: additionalParams.bloodhound}",
                            "to": "body"
                          },
                          {
                            "from": "payload.status",
                            "to": "status"
                          }
                        ]
                      }
                    },
                    {
                      "identifier": "5",
                      "enabled": true,
                      "name": null,
                      "inputName": null,
                      "outputName": null,
                      "type": "SendResponse"
                    }
                  ]
                }
              }
            ]
          }
        }
  let factory = new GeneratorFactory()
  let generator = new EachGenerator('EachAction', actionDef, factory)
  let childGenerator = new ActionGenerator('SendResponseAction', actionDef.definition.actions[0] ,factory)

  describe('._additionalParamsForChildren()', () => {
    it('returns a list of additional params to be added to the input context', () => {
      expect(generator._additionalParamsForChildren()).to.eql(
        {bloodhound: 'bloodhound'}
      )
    })
  })

  describe('._performActions()', () => {
    it('iterator is defined and passes additional params to direct descendents', () => {
      expect(generator._performActions()).to.eql(
        'const payload = Object.assign({}, this.values, this.inputValue)\nconst initialPayload = payload.initialPayload\nconst additionalParams = payload.additionalParams\nfor (let bloodhound of [1,2]) {          \n  await this.performSendResponseAction({bloodhound: bloodhound})\n}'
      )
    })
  })

  describe('.grandchild _performActions()', () => {
    it('grand children of the each action do not have additional params', () => {
      expect(childGenerator._performActions()).to.eql(
        '\nawait this.performTransformAction()\n\n    if (this.canProceed()) {\n      await this.performSendResponse2Action()\n    }'
      )
    })
  })



})
