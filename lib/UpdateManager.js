const AppManager = require('./AppManager')
const cookieParser = require('cookie-parser')
const middleware = cookieParser(process.env.COOKIE_SIGNATURE)
const { createClient } = require('redis')

const RECONNECT_TIME = 500

class UpdateManager {
  constructor(request, appId, connection) {
    this.request = request
    this.appId = appId
    this.connection = connection
    this.listener = (message) => this.message(message)

    this.connection.on('close', () => this.closed())
    this.subscribe()

    this.logger.info('websocket connected')
  }

  get logger() {
    return this.request.httpRequest.log || console
  }

  get hasRedis() {
    return UpdateManager.hasRedis
  }

  closed() {
    this.logger.info('websocket closed')
    this.unsubscribe()
  }

  async subscribe() {
    if (this.hasRedis) {
      try {
        const redis = await UpdateManager.redis(this, true)
        await redis.subscribe(`${this.appId}.webhook`, this.listener)
      } catch (err) {
        this.logger({err}, 'failed to subscribe to redis channel')
      }
    }
  }

  async unsubscribe() {
    if (this.hasRedis) {
      try {
        const redis = await UpdateManager.redis(this, false)
        await redis.unsubscribe(`${this.appId}.webhook`, this.listener)
      } catch (err) {
        this.logger({err}, 'could not unsubscribe from redis channel')
      }
    }
  }

  message(message) {
    const id = parseInt(message, 10)
    this.connection.sendUTF(JSON.stringify({type: 'new', id}))
  }

  static get hasRedis() {
    return process.env.REDIS_URL ? true : false
  }

  static async redis(subscriber, subscribing) {
    if (this.hasRedis) {
      if (! this._redis) {
        this._redis = createClient({
          url: process.env.REDIS_URL,
          socket: {
            reconnectStrategy: retries => {
              this._reconnect()
              return new Error('do not retry')
            }
          }
        })
        this._setupConnection(this._redis)
        await this._redis.connect()
      }
      this._updateSubscribers(subscriber, subscribing)
      return this._redis
    } else {
      return null
    }
  }

  static _updateSubscribers(subscriber, subscribing) {
    if (subscriber) {
      this._subscribers = this._subscribers || []
      const index = this._subscribers.indexOf(subscriber)
      if (subscribing) {
        if (index === -1) {
          this._subscribers.push(subscriber)
        }
      } else {
        this._subscribers.splice(index, 1)
      }
    }
  }

  static get defaultLogger() {
    return this._logger || console
  }

  static set defaultLogger(l) {
    this._logger = l
  }

  static _setupConnection(conn) {
    const logger = this.defaultLogger
    conn.on('error', err => {
      logger.error({err}, '[UpdateManager] Redis client error')
    })
    conn.on('connect', () => logger.info('[UpdateManager] Redis client connecting'))
    conn.on('ready', () => logger.info('[UpdateManager] Redis client connected'))
    conn.on('end', () => logger.info('[UpdateManager] Redis client disconnected'))
    conn.on('reconnecting', () => logger.info('[UpdateManager] Redis client reconnecting'))
  }

  static async _reconnect() {
    if (this._reconnecting) return;
    this._reconnecting = true
    this._redis = null
    while (! this._redis) {
      await new Promise(resolve => setTimeout(resolve, RECONNECT_TIME))
      try {
        await this.redis()
      } catch (err) {
        this.defaultLogger.error({err}, '[UpdateManager] Error while reconnecting')
        this._redis = null
      }
    }
    (this._subscribers || []).forEach(s => s.subscribe())
    this._reconnecting = false
  }

  static async handleRequest(request, logger) {
    // validate origin
    if (process.env.LUPIN_URL &&
        String(request.origin).toLowerCase() !== process.env.LUPIN_URL.toLowerCase()) {
      logger.error({origin: request.origin}, 'Invalid origin')
      return request.reject(401, 'Not authorized')
    }

    // get app id from path
    const match = /^\/webhooks\/([^\/]+)/.exec(request.resourceURL.path)
    if (! match) {
      logger.error({path: request.resourceURL.path}, 'Invalid subscription URL')
      return request.reject(404, 'Not found')
    }
    const appId = match[1]
    request.httpRequest.log = logger.child({websocket: true, appId})

    // middleware was skipped, so parse cookies
    await new Promise(resolve => middleware(request.httpRequest, null, resolve))

    // check authorization
    try {
      await AppManager.requireAuthorization(appId, request.httpRequest)
    } catch (err) {
      request.httpRequest.log.error({err}, 'Not authorized for app')
      return request.reject(401, 'Not authorized')
    }

    new UpdateManager(request, appId, request.accept(null, request.origin))
  }
}

module.exports = UpdateManager
