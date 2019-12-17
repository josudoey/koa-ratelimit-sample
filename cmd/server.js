module.exports = function (prog) {
  prog
    .command('server')
    .option('-p, --port <port>', 'web service listen port default:[3000]', 3000)
    .description('start a http service.')
    .action(async function (opts) {
      const config = require('../app/config')
      config.load(prog.conf)
      const http = require('http')
      const log4js = require('log4js')
      log4js.configure(config.get('log4js'))
      const Log = log4js.getLogger('server')

      const app = require('../app')()
      const listenPort = opts.port
      const server = http.createServer(app.callback()).listen(listenPort)

      app.on('error', function (err) {
        Log.error(err)
      })

      server.on('listening', async function () {
        const address = server.address()
        const port = address.port
        Log.info(`service listen on ${port}`)
        app.emit('listening', server)
      })

      server.on('error', function (err) {
        Log.error(err)
        process.exit(1)
      })

      process.removeAllListeners('uncaughtException')
      process.on('uncaughtException', function (err) {
        Log.error(err.stack)
      })

      process.removeAllListeners('unhandledRejection')
      process.on('unhandledRejection', function (err) {
        Log.error(err.stack)
      })
    })
}
