
var through2 = require('through2')

/**
 * Removes from the stream
 * all tokens matching
 * tag and token
 *
 * @returns {*}
 */
function removeToken(tag, token) {
  return through2.obj(function(chunk, enc, callback){
    var toRemove = []
    chunk.forEach(function(c, i){
      if (c.type==='token:'+tag && c.str.match(token)) {
        toRemove.push(i)
      }
    })
    toRemove.reverse().forEach(function(i){
      chunk.splice(i, 1)
    })
    this.push(chunk)
    callback()
  })
}

module.exports = removeToken
