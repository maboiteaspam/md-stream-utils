
var through2 = require('through2')
var TokenString = require('./token-string.js')

/**
 * Invoke provided callback
 * every the stream has hit
 * subsequent start / end tags
 * of the given type, optionally
 * restricted by its token representation
 *
 * @returns {*}
 */
function extractBlock(tag, token, then) {
  if (!then) {
    then = token
    token = null
  }
  //var whitespace = false
  //if (_.isObject(token)) {
  //  whitespace = token.whitespace || whitespace
  //  token = token.token
  //}
  var isInBlock = false
  var t = new TokenString();
  return through2.obj(function(chunk, enc, callback){
    var that = this

    chunk.forEach(function (c) {
      if (c.type.match(/^start:/)
        && c.type.split(':')[1]===tag) {
        //var prespace;
        //if (['pre','both'].indexOf(''+whitespace)>-1) {
        //  prespace = t.less(/^\s$/)
        //}
        if(t.length()) that.push(t)
        t = new TokenString();
        t.append(c)
        isInBlock = true
      } else if (isInBlock
        && c.type.match(/^end:/)
        && c.type.split(':')[1]===tag) {
        //var postspace;
        //if (['post','both'].indexOf(''+whitespace)>-1) {
        //  postspace = t.tail(/^\s$/)
        //}
        t.append(c)
        //if (postspace && postspace.length()) console.log(postspace.tokens)
        if(then) then(t)
        isInBlock = false
        that.push(t)
        t = new TokenString();
      } else {
        t.append(c)
        if (!isInBlock && (t.match(/\n/))) {
          that.push(t)
          t = new TokenString();
        }
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

module.exports = extractBlock