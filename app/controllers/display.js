exports = module.exports = function (app) {
  class Controller { }
  const prop = Controller.prototype

  prop.requestCount = async function (ctx) {
    ctx.status = 200
    ctx.body = ctx.state.requestCount
  }

  return new Controller()
}
