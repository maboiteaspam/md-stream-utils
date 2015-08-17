
var through2 = require('through2')

/**
 * Flattens every structs to their string
 * Useful to pipe to stdout or similar
 *
 * @returns {*}
 */
function flattenToString(fn){
  return through2.obj(function (chunk, enc, callback) {
    var that = this
    chunk.forEach(function (c) {
      var s = fn ? fn(c) : (c.prepend || '') + (c.str || '') + (c.append || '');
      that.push(s)
    })
    callback()
  })
}

module.exports = flattenToString
