
var through2 = require('through2')

/**
 * Split given TokenString
 * by \n to pack and push lines.
 *
 * @returns {*}
 */
function byLine() {
  var t; // should be a TokenString
  return through2.obj(function(chunk, enc, callback){

    if (!t) {
      t = chunk
    } else {
      t.concat(chunk)
    }

    if (t.match(/\n/)) {
      this.push(t)
      t=null
    }

    callback()

  }, function (callback) {
    if (t) {
      this.push(t)
      t=null
    }
    callback()
  })
}

module.exports = byLine
