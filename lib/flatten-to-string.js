
var through2 = require('through2')

/**
 * Flattens every structs to their string
 * Useful to pipe to stdout or similar
 *
 * @returns {*}
 */
function flattenToString(){
  return through2.obj(function (chunk, enc, callback) {
    var that = this
    chunk.forEach(function (c) {
      that.push((c.prepend || '') + (c.str || '') + (c.append || ''))
    })
    callback()
  })
}

module.exports = flattenToString
