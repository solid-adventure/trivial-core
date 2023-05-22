const AdmZip = require('adm-zip')

// Writer for code generation that writes to a zip archive
class ZipWriter {
  constructor() {
    this.zip = new AdmZip()
  }

  async write(fileName, data) {
    return this.zip.addFile(fileName, data)
  }

  async toBuffer() {
    return await this.zip.toBufferPromise()
  }
}

module.exports = ZipWriter
