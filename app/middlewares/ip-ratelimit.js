const LRU = require('lru-cache')
const Solo = require('../promise-solo')
exports = module.exports = function (opts) {
  const db = opts.levelDb
  const limit = opts.limit || 60
  const duration = opts.duration || 60000

  const coroutines = new LRU({
    maxAge: 2 * duration
  })

  const addRequestCount = async function (ctx) {
    const key = ctx.ip
    let times = await db.get(key).catch(function (err) {
      if (err.notFound) {
        return
      }
      throw err
    })

    if (!times) {
      times = []
    }

    const now = Date.now()
    const staleTime = now - duration
    let staleIndex
    for (staleIndex = 0; staleIndex < times.length; staleIndex++) {
      if (staleTime > times[staleIndex]) {
        break
      }
    }
    times.splice(staleIndex)

    if (times.length >= limit) {
      return times.length + 1
    }

    times.unshift(now)
    await db.put(key, times)
    return times.length
  }

  return async function (ctx, next) {
    let queryRequestCountSolo = coroutines.get(ctx.ip)
    if (!queryRequestCountSolo) {
      const coroutine = Solo()
      queryRequestCountSolo = coroutine(addRequestCount)
      coroutines.set(ctx.ip, queryRequestCountSolo)
    }
    const requestCount = await queryRequestCountSolo(ctx)
    if (requestCount > limit) {
      ctx.status = 429
      ctx.body = 'Error'
      return
    }
    ctx.state.requestCount = requestCount
    await next()
  }
}
