const ActionDescriptors = require('./actionsv2/catalog/ActionDescriptors')
const ActionIterator = require('./actionsv2/catalog/ActionIterator')

class ManifestMigrator {
  static get CURRENT_VERSION() {
    return 1
  }

  constructor(content) {
    this.content = JSON.parse(JSON.stringify(content)) // deep copy
  }

  migrate() {
    if (this.content.manifest_version === undefined) {
      this.migrateV0()
    }
    this.normalize()

    return this.content
  }

  normalize() {

    // Early manifests could not disable actions; set enabled to true if not present
    let iterator = new ActionIterator(this.content.program)
    iterator.visitAll(def => {
      if (!def.hasOwnProperty('enabled')) {
        def.enabled = true
      }
    })

    // This is likely v1 foramtting; "program" has replaced "processors" 
    if (!this.content.blocks) {
      this.content.blocks = []
    }
    let id = 0
    this.content.processors.forEach(proc => {
      (proc.actions || []).forEach(a => {
        if (! a.hasOwnProperty('identifier')) {
          a.identifier = (++id).toString()
        }
      })
    })
  }

  migrateV1(descriptiveName) {
    if (this.content.manifest_version === 2) {
      return
    }
    if (this.content.manifest_version !== 1) {
      throw new Error('Invalid version number. Expected version 1')
    }

    this.normalize()

    let lastIdentifier = Math.max(0, ...this.content.processors.map(p => {
      return Math.max(...p.actions.map(a => parseInt(a.identifier)))
    }))

    const program = ActionDescriptors.actionDefinitionOfType('ReceiveWebhook', ++lastIdentifier)
    program.name = descriptiveName || this.content.app_id
    let branch = program.definition.actions
    const topicCount = Object.keys(this.content.filters).length

    if (topicCount > 0) {
      const group = ActionDescriptors.actionDefinitionOfType('Group', ++lastIdentifier)
      group.name = `Set topic`
      branch.push(group)
      branch = group.definition.actions

      const block = ActionDescriptors.actionDefinitionOfType('Transform', ++lastIdentifier)
      block.name = `Default topic to null`
      block.outputName = 'topic'
      block.definition.transformations.push({from: 'null', to: 'topic'})
      branch.push(block)
    }

    [...Object.entries(this.content.filters)].forEach(entry => {
      const [name, conditions] = entry
      const stmt = ActionDescriptors.actionDefinitionOfType('If', ++lastIdentifier)
      stmt.name = `If matches ${name} topic`
      stmt.definition.condition = conditions.map(c => `(${c})`).join(' && ')
      const block = ActionDescriptors.actionDefinitionOfType('Transform', ++lastIdentifier)
      block.name = `Set topic to ${name}`
      block.outputName = 'topic'
      block.definition.transformations.push({from: JSON.stringify(name), to: 'topic'})
      stmt.definition.then.push(block)
      branch.push(stmt)
    })

    branch = program.definition.actions
    this.content.processors.forEach(proc => {
      const skipTopicCheck = proc.topics.length === 0 ||
        (proc.topics.length === 1 && proc.topics[0] === null && topicCount == 0)

      if (!skipTopicCheck) {
        const stmt = ActionDescriptors.actionDefinitionOfType('If', ++lastIdentifier)
        stmt.name = `If topic is ${proc.topics.map(t => String(t)).join(', ')}`
        stmt.inputName = 'topic'
        stmt.definition.condition = `${JSON.stringify(proc.topics)}.indexOf(topic) !== -1`
        branch.push(stmt)
        branch = stmt.definition.then
      }

      proc.actions.forEach(action => {
        if (action.transform) {
          const trans = ActionDescriptors.actionDefinitionOfType('Transform', ++lastIdentifier)
          trans.definition.from = action.transform.from
          trans.definition.to = action.transform.to
          trans.definition.transformations = action.transform.transformations.map(t => {
            return {from: t[0], to: t[1]}
          })
          branch.push(trans)
        }

        const newAction = ActionDescriptors.actionDefinitionOfType(
          this.actionNameV2(action.perform),
          action.identifier
        )
        newAction.config = action.config
        if (newAction.type === 'HttpRequest') {
          newAction.config.custom_headers =
            (newAction.config.custom_headers || '')
            .split(/\s*,\s*/)
            .map(header => {
              const parts = header.split(/\s*:\s*/)
              return {name: parts[0], value: parts[1]}
            })
        }
        branch.push(newAction)
      })

      branch = program.definition.actions
    })

    this.content.definitions = this.content.blocks.map(block => {
      return Object.assign({type: 'function'}, block)
    })

    this.content.program = program
    this.content.filters = {}
    this.content.processors = []
    this.content.blocks = []
    this.content.manifest_version = 2
  }

  actionNameV2(name) {
    const nameMap = {
      'CreateZendeskTicket': 'Zendesk/CreateTicket',
      'HTTPRequest': 'HttpRequest',
      'SendMailgunEmail': 'Mailgun/SendEmail',
      'SendTwilioSMS': 'Twilio/SendSMS'
    }

    return nameMap[name] || name;
  }

  migrateV0() {
    if (this.content.manifest_version !== undefined) {
      throw new Error('Invalid version number. Expected no version number')
    }

    const actions = this.content.actions || []
    const transforms = (this.content.transforms || []).reverse()
    delete this.content.actions
    delete this.content.transforms

    function transformForTopics(topics) {
      return transforms.find(trans => {
        return topics.every(topic => trans.topics.indexOf(topic) !== -1)
      })
    }

    // split actions where more than one transform may apply
    actions.forEach(action => {
      if (action.topics.length > 1 && transformForTopics(action.topics) === undefined) {
        let moreTopics = actions.topics.splice(1, action.topics.length - 1)
        moreTopics.each(t => {
          actions.push({
            perform: action.perform,
            topics: [t],
            config: Object.assign({}, action.config)
          })
        })
      }
    })

    this.content.processors = actions.map(action => {
      let mapped = {
        topics: action.topics,
        actions: [{
          perform: action.perform,
          config: action.config
        }]
      }

      let transform = transformForTopics(action.topics)
      if (transform) {
        mapped.actions[0].transform = {
          from: transform.from,
          to: transform.to,
          transformations: [].concat(transform.transformations)
        }
      } else {
        mapped.actions[0].transform = {
          from: 'GenericObject',
          to: 'GenericObject',
          transformations: []
        }
      }

      return mapped
    })

    this.content.manifest_version = 1
  }
}

module.exports = ManifestMigrator
