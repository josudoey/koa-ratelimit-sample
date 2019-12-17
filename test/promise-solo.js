/* eslint-env node, mocha */

const assert = require('assert')
const sinon = require('sinon')
const createSoloWrap = require('../app/promise-solo')

describe('solo normal function', function () {
  let solo
  const sum = function (a, b) {
    return a + b
  }
  beforeEach(function () {
    solo = createSoloWrap()
  })

  it('shoud only one running', function (done) {
    const spy = sinon.spy(sum)
    const sumSolo = solo(spy)
    sumSolo(1, 2).then(function (result) {
      assert(spy.calledOnce)
      assert(spy.firstCall.args[0] === 1, 'args[0] should is 1')
      assert(spy.firstCall.args[1] === 2, 'args[0] should is 2')
      assert(result === 3, 'result should is 3')
    }).catch(done)

    sumSolo(3, 4).then(function (result) {
      assert(spy.calledTwice)
      assert(spy.lastCall.args[0] === 3, 'args[0] should is 3')
      assert(spy.lastCall.args[1] === 4, 'args[0] should is 4')
      assert(result === 7, 'result should is 7')
      done()
    }).catch(done)

    assert(spy.notCalled)
  })

  it('argument exception', function () {
    assert.throws(function () {
      solo()
    }, TypeError, 'should throw TypeError')
    assert.throws(function () {
      solo('fake')
    }, TypeError, 'should throw TypeError')
    assert.throws(function () {
      solo({})
    }, TypeError, 'should throw TypeError')
  })
})

describe('solo async function ', function () {
  let solo
  const delay = function (ms, spy) {
    spy()
    return new Promise(function (resolve) {
      setTimeout(function () {
        spy()
        resolve()
      }, ms)
    })
  }

  beforeEach(function () {
    solo = createSoloWrap()
  })

  it('shoud only one running', function (done) {
    const spy = sinon.spy(delay)
    const spy1 = sinon.spy()
    const spy2 = sinon.spy()
    const delaySolo = solo(spy)
    delaySolo(10, spy1).then(function () {
      assert(spy.calledOnce)
      assert(spy1.calledTwice)
      assert(spy2.notCalled)
      assert(spy.firstCall.args[0] === 10, 'args[0] should is 1')
      assert(spy.firstCall.args[1] === spy1, 'args[1] should is spy1')
    }).catch(done)
    delaySolo(1, spy2).then(function () {
      assert(spy.calledTwice)
      assert(spy1.calledTwice)
      assert(spy2.calledTwice)
      assert(spy.lastCall.args[0] === 1, 'args[0] should is 1')
      assert(spy.lastCall.args[1] === spy2, 'args[1] should is spy2')
    }).then(done).catch(done)
    assert(spy.notCalled)
    assert(spy1.notCalled)
    assert(spy2.notCalled)
  })

  it('normal function throw error', function (done) {
    const spy = sinon.spy(function () {
      throw new Error('fake')
    })
    const throwSolo = solo(spy)
    throwSolo().then(function () {
      done(new Error('not should run here'))
    }).catch(function (err) {
      assert.strictEqual(err.message, 'fake', 'should reject error')
    }).then(done).catch(done)
    assert(spy.notCalled)
  })

  it('async function reject', function (done) {
    const spy = sinon.spy(delay)
    const delaySolo = solo(spy)
    const rejectSolo = solo(function () {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error('fake'))
        }, 0)
      })
    })
    const spy1 = sinon.spy()
    const spy2 = sinon.spy()
    delaySolo(10, spy1)
    rejectSolo().then(function () {
      done(new Error('not should run here'))
    }).catch(function (err) {
      assert.strictEqual(err.message, 'fake', 'should reject error')
    }).catch(done)
    delaySolo(1, spy2).then(function () {
      assert(spy.calledTwice)
      assert(spy1.calledTwice)
      assert(spy2.calledTwice)
      assert(spy.lastCall.args[0] === 1, 'args[0] should is 1')
      assert(spy.lastCall.args[1] === spy2, 'args[1] should is spy2')
    }).catch(done).then(done)
    assert(spy.notCalled)
    assert(spy1.notCalled)
    assert(spy2.notCalled)
  })
})
