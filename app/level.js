const level = require('level')

exports = module.exports = function (storePath, opts) {
  const db = level(storePath, opts)
  return db
}
