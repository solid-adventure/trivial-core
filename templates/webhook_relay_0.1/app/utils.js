const pino = require('pino')
const logger = pino({level: process.env.LOG_LEVEL || 'info'})
const loadErrors = {}

function tryRequire(mod) {
  try {
    return require(mod)
  } catch (err) {
    logger.error({err}, `Failed to load module '${mod}'`)
    loadErrors[mod] = err
  }
}
module.exports.tryRequire = tryRequire

function lastLoadErrorFor(mod) {
  return loadErrors[mod]
}
module.exports.lastLoadErrorFor = lastLoadErrorFor
