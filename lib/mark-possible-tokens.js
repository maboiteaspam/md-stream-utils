
var through2 = require('through2')

/**
 * Given a stream pushing
 * items by line.
 * Identifies lines starting with given token,
 * and mark the line with a starting tag node
 * and an ending tag node.
 *
 * @returns {*}
 */
function markPossibleTokens(tokens) {
  return through2.obj(function(chunk, enc, callback){
    chunk.forEach(function (c){
      if (tokens.indexOf(c.str)>-1) {
        c.type = 'maybe:token'
      }
    })
    this.push(chunk, enc)
    callback()
  })
}

module.exports = markPossibleTokens
