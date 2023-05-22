const path = require('path')
const fs = require('fs')

// Writer for code generation that writes directly to the file system
class FileWriter {
  constructor(dir) {
    this.dir = dir
  }

  async write(fileName, data) {
    if (fileName.includes('.DS_Store')) { return }
    let full_path = path.join(this.dir, fileName)
    let full_dir = path.dirname(full_path)
    if ( !fs.existsSync(full_dir) ) {
        await fs.mkdirSync(full_dir, { recursive: true });
    }
    return await fs.promises.writeFile(full_path, data)
  }
}

module.exports = FileWriter
