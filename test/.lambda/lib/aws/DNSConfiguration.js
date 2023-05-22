const {
  Route53Client,
  ChangeResourceRecordSetsCommand,
  ListHostedZonesByNameCommand,
  ListResourceRecordSetsCommand
} = require('@aws-sdk/client-route-53')

class DNSConfiguration {
  // valid options:
  //  - logger
  constructor(zoneName, options) {
    this.zoneName = zoneName
    this.client = new Route53Client()
    this.options = Object.assign({}, options)
    this.logger = this.options.logger || console
  }

  async aliasNameToLoadBalancer(name, loadBalancerConfiguration) {
    const qualName = this.nameInZone(name)
    this.logger.debug(`[DNSConfiguration][aliasNameToLoadBalancer] adding ${qualName} as an alias for ${loadBalancerConfiguration.elbName}`)
    const response = await this.client.send(
      new ChangeResourceRecordSetsCommand({
        HostedZoneId: await this.hostedZoneId(),
        ChangeBatch: {
          Changes: [{
            Action: 'CREATE',
            ResourceRecordSet: {
              Name: qualName,
              Type: 'A',
              AliasTarget: {
                DNSName: await loadBalancerConfiguration.dnsName(),
                EvaluateTargetHealth: true,
                HostedZoneId: await loadBalancerConfiguration.hostedZoneId()
              }
            }
          }]
        }
      })
    )
    return response
  }

  async hasEntryName(name) {
    const qualName = this.nameInZone(name)
    const response = await this.client.send(
      new ListResourceRecordSetsCommand({
        HostedZoneId: await this.hostedZoneId(),
        StartRecordName: qualName,
        MaxItems: 1
      })
    )

    return response.ResourceRecordSets.length > 0 &&
      qualName === response.ResourceRecordSets[0].Name
  }

  async removeNameForLoadBalancer(name, loadBalancerConfiguration) {
    const qualName = this.nameInZone(name)
    this.logger.debug(`[DNSConfiguration][removeNameForLoadBalancer] removing ${qualName} as an alias for ${loadBalancerConfiguration.elbName}`)
    const response = await this.client.send(
      new ChangeResourceRecordSetsCommand({
        HostedZoneId: await this.hostedZoneId(),
        ChangeBatch: {
          Changes: [{
            Action: 'DELETE',
            ResourceRecordSet: {
              Name: qualName,
              Type: 'A',
              AliasTarget: {
                DNSName: await loadBalancerConfiguration.dnsName(),
                EvaluateTargetHealth: true,
                HostedZoneId: await loadBalancerConfiguration.hostedZoneId()
              }
            }
          }]
        }
      })
    )
    return response
  }

  nameInZone(name) {
    let resolved = name.replace(/@$/, `${this.zoneName}.`)
    if (resolved.slice(-1) !== '.') {
      resolved = `${name}.${this.zoneName}.`
    }
    return resolved
  }

  async hostedZoneId() {
    return this._hostedZoneId = this._hostedZoneId || await this._findZoneId()
  }

  async _findZoneId() {
    const response = await this.client.send(
      new ListHostedZonesByNameCommand({
        DNSName: this.zoneName
      })
    )

    return response.HostedZones[0].Id
  }
}

module.exports = DNSConfiguration
