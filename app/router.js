module.exports = (app) => {
  const log = require('./middlewares/log')
  const display = require('./controllers/display')(app)
  const koaRouter = require('koa-router')
  const router = koaRouter({})
  router.use(log)
  router.get('/', app.ipRatelimit, display.requestCount)
  return router
}
