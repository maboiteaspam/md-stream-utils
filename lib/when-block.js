
var through2 = require('through2')
var TokenString = require('./token-string.js')

/**
 * Invoke provided callback
 * every time a chunk contains
 * given start tag, optionally
 * restricted by its token representation
 *
 * Invoke provided callback
 * every time a chunk contains
 * given start tag
 *
 * Should be used
 * with extractBlockWithWhitespace / extractBlock
 *
 * @returns {*}
 */
function whenBlock(tag, token, then) {
  if (!then) {
    then = token
    token = null
  }
  var t = new TokenString();
  var index = 0
  return through2.obj(function(chunk, enc, callback){
    if (chunk.length()) {
      if (chunk.indexOfType('start:'+tag)>-1
        && (!token || chunk.filterType('start:'+tag).tokenStr.match(token))) {
        then (chunk, index)
        index++;
      }
      this.push(chunk)
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

module.exports = whenBlock
