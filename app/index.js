const Koa = require('koa')
const config = require('./config')
exports = module.exports = function (opts) {
  const app = new Koa()
  app.config = config
  app.proxy = config.get('app.proxy')
  app.keys = config.get('app.keys')

  const db = require('./level')(config.get('ratelimit.store.path'), {
    valueEncoding: 'json'
  })

  app.ipRatelimit = require('./middlewares/ip-ratelimit')({
    levelDb: db,
    duration: 60000,
    limit: 60
  })

  const router = require('./router')(app)
  app.use(router.routes())
  return app
}
