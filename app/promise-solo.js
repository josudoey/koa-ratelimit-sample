module.exports = function () {
  let last = Promise.resolve()
  const wrap = function (func, self) {
    if (typeof func !== 'function') {
      throw new TypeError('"func" argument must be a function')
    }
    return function () {
      const args = Array.prototype.slice.call(arguments)
      last = new Promise(function (resolve, reject) {
        const next = function () {
          try {
            const r = func.apply(self, args)
            if (!r || !r.then) {
              return resolve(r)
            }
            r.then(resolve).catch(reject)
          } catch (e) {
            reject(e)
          }
        }
        last.then(next).catch(next)
      })
      return last
    }
  }

  return wrap
}
