
var through2 = require('through2')
var TokenString = require('./token-string.js')

/**
 * Split given TokenString
 * by \n to pack and push lines.
 *
 * @returns {*}
 */
function byLine(then) {
  var t = new TokenString(); // should be a TokenString
  return through2.obj(function(chunk, enc, callback){
    var that = this

    t.concat(chunk);

    t.splice(0).split('\n').forEach(function (line) {
      if (line.last().str.match(/\n/)) {
        if (then) then(line)
        if (line.length()) that.push(line)
      } else {
        t.concat(line)
      }
    })

    callback()

  }, function (callback) {
    var that = this
    t.splice(0).split('\n').forEach(function (line) {
      if (then) then(line)
      if (line.length()) that.push(line)
    })
    callback()
  })
}

module.exports = byLine
