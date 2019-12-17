/* eslint-env mocha */
const assert = require('assert')
const sinon = require('sinon')
const tmp = require('tmp')
const delay = function (ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}
describe('middlewares/ip-ratelimit', function () {
  let tmpdir, ipRatelimit

  describe('base', function () {
    before(async function () {
      tmpdir = tmp.dirSync({
        unsafeCleanup: true
      })
      const db = require('../app/level')(tmpdir.name, {
        valueEncoding: 'json'
      })

      ipRatelimit = require('../app/middlewares/ip-ratelimit')({
        levelDb: db,
        duration: 300,
        limit: 3
      })
    })

    after(async function () {
      tmpdir.removeCallback()
    })

    it('request 1~3', async function () {
      for (let i = 1; i <= 3; i++) {
        const next = sinon.spy()
        const ctx = {
          ip: '127.0.0.1',
          state: {}
        }
        await ipRatelimit(ctx, next)
        assert.strictEqual(ctx.state.requestCount, i)
        assert(next.calledOnce)
      }
    })

    it('request Error', async function () {
      const next = sinon.spy()
      const ctx = {
        ip: '127.0.0.1',
        state: {}
      }
      await ipRatelimit(ctx, next)
      assert.strictEqual(ctx.body, 'Error')
      assert.strictEqual(ctx.status, 429)
      assert(next.notCalled)
    })

    it('reset count', async function () {
      await delay(300)
      const next = sinon.spy()
      const ctx = {
        ip: '127.0.0.1',
        state: {}
      }
      await ipRatelimit(ctx, next)
      assert.strictEqual(ctx.state.requestCount, 1)
      assert(next.calledOnce)
    })
  })
})
