
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

      if(t.filterType('start:'+tag).length()) {
        if (t.filterType('end:'+tag).length()) {
          if (!c.str.length
            || c.str.match(/\S+/)){
            if (then) then(t)
            that.push(t)
            t = new TokenString()
          }
        }
        t.append(c)
      }else if(c.type.match(/^start:/)
        && c.type.match(tag)
        && (!token || c.tokenStr.match(token))) {
        var tail = new TokenString();
        if (t.match(/\S/)) {
          tail.concat(t.tailMatch(/\s/))
          if (t.length()) that.push(t)
        } else {
          tail = t.splice(0)
        }
        t = new TokenString()
        t.concat(tail)
        t.concat(chunk.splice(0, i+1))

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
      var foot = t.tailUntilMatch(/\S/)
      if (t.indexOfType('end:'+tag) > -1 && then) then(t)
      this.push(t)
      this.push(foot)
      t=null
    }
    callback()
  })
}

module.exports = extractBlockWithWhitespace
