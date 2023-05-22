const {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  DeleteLogGroupCommand,
  PutRetentionPolicyCommand,
  DescribeLogGroupsCommand
} = require('@aws-sdk/client-cloudwatch-logs')

class LogConfiguration {
  // valid options:
  //  - logger
  constructor(options) {
    this.client = new CloudWatchLogsClient()
    this.options = Object.assign({}, options)
    this.logger = this.options.logger || console
  }

  lambdaLogGroupName(lambdaName) {
    return `/aws/lambda/${lambdaName}`
  }

  // valid options:
  //  - retentionInDays
  async createLambdaLogGroup(lambdaName, options) {
    const logGroupName = this.lambdaLogGroupName(lambdaName)
    await this._createLogGroupIfNotExists(logGroupName)

    if (options && 'retentionInDays' in options) {
      this.logger.debug(`[LogConfiguration][createLambdaLogGroup] setting retention to ${options.retentionInDays} days for ${logGroupName}`)
      await this.client.send(
        new PutRetentionPolicyCommand({
          logGroupName,
          retentionInDays: options.retentionInDays
        })
      )
    }
  }

  async lambdaHasLogGroup(lambdaName) {
    const logGroupName = this.lambdaLogGroupName(lambdaName)
    this.logger.debug(`[LogConfiguration][lambdaHasLogGroup] looking for log group ${logGroupName}`)
    const groups = await this.client.send(
      new DescribeLogGroupsCommand({
        logGroupNamePrefix: logGroupName
      })
    )

    return undefined !== groups.logGroups.find(g => g.logGroupName === logGroupName)
  }

  async _createLogGroupIfNotExists(name) {
    try {
      this.logger.debug(`[LogConfiguration][_createLogGroupIfNotExists] creating log group ${name}`)
      await this.client.send(
        new CreateLogGroupCommand({logGroupName: name})
      )
    } catch (e) {
      if ('ResourceAlreadyExistsException' !== e.name) {
        throw e
      }
    }
  }

  async deleteLambdaLogs(lambdaName) {
    try {
      const logGroupName = this.lambdaLogGroupName(lambdaName)
      this.logger.debug(`[LogConfiguration][deleteLambdaLogs] removing log group ${logGroupName}`)
      await this.client.send(
        new DeleteLogGroupCommand({logGroupName})
      )
    } catch (e) {
      if ('ResourceNotFoundException' !== e.name) {
        throw e
      }
    }
  }
}

module.exports = LogConfiguration
