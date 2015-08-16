
var through2 = require('through2')
var TokenString = require('./token-string.js')

/**
 * Invoke provided callback
 * every the stream has hit
 * subsequent start / end tags
 * of the given type, optionally
 * restricted by its token representation
 *
 * It will include pre and post whitespaces (spaces, newlines)
 *
 * @returns {*}
 */
function extractBlockWithWhitespace(tag, token, then) {
  if (!then) {
    then = token
    token = null
  }
  var t = new TokenString();
  return through2.obj(function(chunk, enc, callback){
    var that = this

    chunk.forEach(function(c, i){

      if(c.type.match(/^start:/)
        && c.type.match(tag)
        && (!token || c.tokenStr.match(token))) {
        var tail = t.lessUntil(/\s/)
        if (tail.length()) that.push(tail)
        t = new TokenString()
        t.concat(chunk.splice(0, i+1))

      } else if(t.filterType('start:'+tag).length()) {

        if(c.type.match(/^end:/)
          && c.type.match(tag)
          && (!token || c.tokenStr.match(token))) {
          t.concat(chunk.splice(0, chunk.indexOfType('end:'+tag)+1))

        } else if (t.filterType('end:'+tag).length()) {

          if (!c.str || c.str.match(/\S+/)){
            if (then) then(t)
            that.push(t)
            t = new TokenString()
            var y = (new TokenString())
            y.append(c)
            that.push(y)
          } else {
            t.append(c)
          }
        }

      } else {
        if (c.str.match(/\s+/)) {
          if (t.match(/\S+/)) {
            that.push(t)
            t = new TokenString()
          }
        }
        t.append(c)
      }
    })

    callback()
  }, function (callback) {
    if (t) {
      this.push(t)
      t=null
    }
    callback()
  })
}

module.exports = extractBlockWithWhitespace
