/* eslint-env node, mocha */
const tmp = require('tmp')
const supertest = require('supertest')

describe('app', function () {
  let app, req, tmpdir
  const config = require('../app/config')

  before(async function () {
    const http = require('http')
    tmpdir = tmp.dirSync({
      unsafeCleanup: true
    })
    config.set('ratelimit.store.path', tmpdir.name)
    app = require('../app')()
    req = supertest(http.createServer(app.callback()))
  })

  after(async function () {
    tmpdir.removeCallback()
  })

  describe('GET /', function () {
    it('200', async function () {
      for (let i = 1; i <= 60; i++) {
        await req.get('/')
          .expect(200, i.toString())
      }
    })

    it('429', async function () {
      await req.get('/')
        .expect(429, 'Error')
    })
  })
})
