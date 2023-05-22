const {
  ElasticLoadBalancingV2Client,
  CreateRuleCommand,
  CreateTargetGroupCommand,
  DeleteRuleCommand,
  DeleteTargetGroupCommand,
  DescribeListenersCommand,
  DescribeLoadBalancersCommand,
  DescribeRulesCommand,
  DescribeTargetGroupsCommand,
  DescribeTargetHealthCommand,
  RegisterTargetsCommand
} = require('@aws-sdk/client-elastic-load-balancing-v2')
const {
  LambdaClient,
  AddPermissionCommand,
  GetPolicyCommand
} = require('@aws-sdk/client-lambda')

class LoadBalancerConfiguration {
  // valid options:
  //  - logger
  constructor(elbName, options) {
    this.elbName = elbName
    this.client = new ElasticLoadBalancingV2Client()
    this.options = Object.assign({}, options)
    this.logger = this.options.logger || console
    this.allowedPorts = [/*80,*/ 443]
  }

  // valid options:
  //  - hostname
  //  - method
  //  - path
  async addRouteToLambda(name, lambdaArn, options) {
    options = Object.assign({}, options)

    const groupName = `${name}-group`
    let groupArn = await this._targetGroupArn(groupName)
    if (undefined === groupArn) {
      groupArn = await this._createTargetGroup(groupName, lambdaArn)
    } else {
      await this._configureTargetGroup(groupName, groupArn, lambdaArn)
    }

    await this._createLambdaRules(groupArn, options)
  }

  async removeRoutesForLambda(name, lambdaArn) {
    const groupName = `${name}-group`
    const groupArn = await this._targetGroupArn(groupName)
    if (groupArn) {
      await this._removeLambdaRules(groupArn)
      await this._removeTargetGroup(groupArn)
    }
  }

  async lambdaHasRoute(name) {
    const groupName = `${name}-group`
    const groupArn = await this._targetGroupArn(groupName)

    if (undefined === groupArn)
      return false;

    let listeners = await this.listeners()
    listeners = listeners.filter(l => this.allowedPorts.indexOf(l.Port) !== -1)

    for (let i = 0; i < listeners.length; ++i) {
      const rules = await this._listenerRules(listeners[i].ListenerArn)
      for (let j = 0; j < rules.length; ++j) {
        if (this._isRuleForGroup(rules[j], groupArn)) {
          return true;
        }
      }
    }

    return false;
  }

  async arn() {
    return this._arn = this._arn || await this._findInfo('_arn')
  }

  async dnsName() {
    return this._dnsName = this._dnsName || await this._findInfo('_dnsName')
  }

  async hostedZoneId() {
    return this._hostedZoneId = this._hostedZoneId || await this._findInfo('_hostedZoneId')
  }

  async _findInfo(returnKey) {
    const response = await this.client.send(
      new DescribeLoadBalancersCommand({
        Names: [this.elbName]
      })
    )

    this._arn = response.LoadBalancers[0].LoadBalancerArn
    this._dnsName = response.LoadBalancers[0].DNSName
    this._hostedZoneId = response.LoadBalancers[0].CanonicalHostedZoneId
    return this[returnKey]
  }

  async listeners() {
    const response = await this.client.send(
      new DescribeListenersCommand({
        LoadBalancerArn: await this.arn()
      })
    )

    return response.Listeners
  }

  async _listenerRules(listenerArn) {
    const response = await this.client.send(
      new DescribeRulesCommand({ListenerArn: listenerArn})
    )
    this.logger.info({loadBalancer: this.elbName, ruleCount: response.Rules.length}, 'load balancer rule count')
    return response.Rules
  }

  async _lastRulePriority(listenerArn) {
    this.logger.debug('[LoadBalancerConfiguration][_lastRulePriority] looking up rule priorities')
    const rules = await this._listenerRules(listenerArn)
    const priorities = rules
      .map(r => parseInt(r.Priority, 10))
      .filter(p => ! Number.isNaN(p))
    return Math.max(...priorities)
  }

  async _targetGroupArn(name) {
    this.logger.debug(`[LoadBalancerConfiguration][_targetGroupArn] looking up ${name}`)
    try {
      const response = await this.client.send(
        new DescribeTargetGroupsCommand({Names: [name]})
      )

      return response.TargetGroups[0].TargetGroupArn
    } catch (e) {
      if ('TargetGroupNotFound' === e.name) {
        return undefined
      } else {
        throw e
      }
    }
  }

  async _createTargetGroup(name, lambdaArn) {
    this.logger.debug(`[LoadBalancerConfiguration][_createTargetGroup] creating ${name}`)
    const createRes = await this.client.send(
      new CreateTargetGroupCommand({
        Name: name,
        TargetType: 'lambda'
      })
    )

    const targetGroupArn = createRes.TargetGroups[0].TargetGroupArn
    await this._configureTargetGroup(name, targetGroupArn, lambdaArn)

    return targetGroupArn
  }

  async _configureTargetGroup(name, targetGroupArn, lambdaArn) {
    const hasPolicy = await this._lambdaHasPolicy(lambdaArn)
    if (! hasPolicy) {
      await this._allowLambdaInvocation(name, targetGroupArn, lambdaArn)
    }

    const hasTarget = await this._targetGroupHasTarget(targetGroupArn, lambdaArn)
    if (! hasTarget) {
      this.logger.debug(`[LoadBalancerConfiguration][_configureTargetGroup] adding target`)
      const registerRes = await this.client.send(
        new RegisterTargetsCommand({
          TargetGroupArn: targetGroupArn,
          Targets: [{
            Id: lambdaArn
          }]
        })
      )
    }
  }

  async _targetGroupHasTarget(targetGroupArn, targetArn) {
    const targets = await this.client.send(
      new DescribeTargetHealthCommand({
        TargetGroupArn: targetGroupArn
      })
    )

    return undefined !== targets.TargetHealthDescriptions.find(desc => {
      return desc.Target.Id === targetArn
    })
  }

  async _lambdaHasPolicy(name) {
    try {
      const client = new LambdaClient()
      await client.send(
        new GetPolicyCommand({FunctionName: name})
      )
      return true
    } catch (e) {
      if ('ResourceNotFoundException' === e.name) {
        return false
      } else {
        throw e
      }
    }
  }

  async _allowLambdaInvocation(groupName, groupArn, lambdaArn) {
    this.logger.debug(`[LoadBalancerConfiguration][_allowLambdaInvocation] adding ELB policy statement`)
    const client = new LambdaClient()
    const response = await client.send(
      new AddPermissionCommand({
        FunctionName: lambdaArn,
        Action: 'lambda:InvokeFunction',
        Principal: 'elasticloadbalancing.amazonaws.com',
        StatementId: `AWS-ALB_Invoke-${groupName}_trivial`,
        SourceArn: groupArn
      })
    )
  }

  async _createLambdaRules(groupArn, options) {
    const conditions = []
    if (options.hostname) {
      conditions.push({Field: 'host-header', Values: [options.hostname]})
    }
    if (options.path) {
      conditions.push({Field: 'path-pattern', Values: [options.path]})
    }
    if (options.method) {
      conditions.push({
        Field: 'http-request-method',
        HttpRequestMethodConfig: {Values: [options.method]}
      })
    }

    let listeners = await this.listeners()
    listeners = listeners.filter(l => this.allowedPorts.indexOf(l.Port) !== -1)

    for (let i = 0; i < listeners.length; ++i) {
      this.logger.debug(`[LoadBalancerConfiguration][_createLambaRules] creating rule for port ${listeners[i].Port}`)
      let priority = await this._lastRulePriority(listeners[i].ListenerArn)
      await this.client.send(
        new CreateRuleCommand({
          ListenerArn: listeners[i].ListenerArn,
          Conditions: conditions,
          Priority: priority > 0 ? priority + 1 : 1,
          Actions: [{
            Type: 'forward',
            TargetGroupArn: groupArn
          }]
        })
      )
    }
  }

  _isRuleForGroup(rule, groupArn) {
    return false === rule.IsDefault &&
      undefined !== rule.Actions.find(action => {
        return 'forward' === action.Type && groupArn === action.TargetGroupArn
      })
  }

  async _removeLambdaRules(groupArn) {
    let listeners = await this.listeners()
    listeners = listeners.filter(l => this.allowedPorts.indexOf(l.Port) !== -1)

    for (let i = 0; i < listeners.length; ++i) {
      const rules = await this._listenerRules(listeners[i].ListenerArn)
      for (let j = 0; j < rules.length; ++j) {
        if (this._isRuleForGroup(rules[j], groupArn)) {
          this.logger.debug(`[LoadBalancerConfiguration][_removeLambaRules] removing rule ${rules[j].RuleArn}`)
          await this.client.send(
            new DeleteRuleCommand({RuleArn: rules[j].RuleArn})
          )
        }
      }
    }
  }

  async _targetGroupHasTraffic(groupArn) {
    const response = await this.client.send(
      new DescribeTargetGroupsCommand({TargetGroupArns: [groupArn]})
    )

    return 0 !== response.TargetGroups[0].LoadBalancerArns.length
  }

  async _removeTargetGroup(groupArn) {
    const hasTraffic = await this._targetGroupHasTraffic(groupArn)
    if (! hasTraffic) {
      this.logger.debug('[LoadBalancerConfiguration][_removeTargetGroup] removing target group')
      await this.client.send(
        new DeleteTargetGroupCommand({TargetGroupArn: groupArn})
      )
    }
  }
}

module.exports = LoadBalancerConfiguration
