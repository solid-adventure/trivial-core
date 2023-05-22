const ActionBase = require('../../base/ActionBase')

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const createWriteStream = require('fs').createWriteStream
const pipeline = require('stream').pipeline
const promisify = require('util').promisify
const fsPromises = require('fs').promises;

class MailgunAction extends ActionBase {
  async perform(){

    const mailgun = new Mailgun(formData)
    const mg = mailgun.client({username: 'api', key: this.config.mailgun.api_key});
    const domain = this.config.mailgun.domain
    let body = await this.body()
    let res = await mg.messages.create(domain, body)

    this.logger.info(
      {status: res.status, body: body},
      `[${this.name}][perform] complete`
    )

    this.setHTTPResponseOutput(res, res);
    return true
  }

  get attachment_filename() {
    const url = this.inputValue.attachment_url
    let urlParts = url.split('/')
    return urlParts[urlParts.length - 1]
  }

  async downloadAttachements() {
    const streamPipeline = promisify(pipeline);
    const url = this.inputValue.attachment_url
    const response = await this.fetch(url);
    let path = `/tmp/${this.attachment_filename}`
    if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
    await streamPipeline(response.body, createWriteStream(path))
    return path
  }

  async processAttachment() {
    if (!this.inputValue.attachment_url) { return {} }
    let out
    let sequence = await this.downloadAttachements()
    .then(path => fsPromises.readFile(path))
    .then(data => out = {
              filename: this.attachment_filename,
              data
          })
    .finally(e => this.logEvent('processAttachment', true, {readAttachment: true}) )
    .catch(e => { throw new Error(`${e}`)} )
    await sequence
    return {attachment: out}
  }

  async body() {
    let attachment = await this.processAttachment()
    let out = Object.assign(this.inputValue, attachment)
    return out
  }

}

module.exports = MailgunAction
