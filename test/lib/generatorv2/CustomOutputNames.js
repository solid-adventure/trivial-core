const { expect } = require('chai')
const EachGenerator = require('../../../lib/generatorv2/EachGenerator')
const ActionGenerator = require('../../../lib/generatorv2/ActionGenerator')
const GeneratorFactory = require('../../../lib/generatorv2/GeneratorFactory')

describe('EachGenerator', () => {

  let actionDef = {
    "identifier": "1",
    "enabled": true,
    "name": "",
    "inputName": null,
    "outputName": null,
    "type": "ReceiveWebhook",
    "definition": {
      "actions": [
        {
          "identifier": "8",
          "enabled": true,
          "name": null,
          "inputName": null,
          "outputName": "manualOutputName",
          "type": "Custom",
          "definition": {
            "code": "return [1,2,3]\n"
          }
        },
        {
          "identifier": "9",
          "enabled": true,
          "name": null,
          "inputName": null,
          "outputName": null,
          "type": "Each",
          "definition": {
            "list": "manualOutputName",
            "item_name": "item",
            "actions": [
              {
                "identifier": "10",
                "enabled": true,
                "name": "SendResponse",
                "inputName": null,
                "outputName": null,
                "type": "ActionWithTransform",
                "definition": {
                  "actions": [
                    {
                      "identifier": "11",
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
                            "from": "{item: item}",
                            "to": "body"
                          },
                          {
                            "from": "200",
                            "to": "status"
                          }
                        ]
                      }
                    },
                    {
                      "identifier": "12",
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
      ]
    }
  }
  let factory = new GeneratorFactory({program: actionDef})
  let generator = new EachGenerator('EachAction', actionDef.definition.actions[1], factory)

  describe('._performActions()', () => {
    it('manual output name is defined', () => {
      expect(generator._performActions()).to.eql(
        'const payload = Object.assign({}, this.values, this.inputValue)\nconst initialPayload = payload.initialPayload\nconst additionalParams = payload.additionalParams\n  const manualOutputName = payload.manualOutputName\nfor (let item of manualOutputName) {          \n  await this.performSendResponseAction({item: item})\n}'
      )
    })
  })

  describe('.factory.outputNames', () => {
    it('manual output names are defined on factory', () => {
      expect(factory.outputNames).to.eql(
        ['manualOutputName']
      )
    })
  })



})
