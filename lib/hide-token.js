
var through2 = require('through2')

/**
 * Empty tokens string of
 * all tokens matching
 * tag and token
 *
 * @returns {*}
 */
function hideToken(tag, token) {
  return through2.obj(function(chunk, enc, callback){
    chunk.forEach(function(c, i){
      if (c.type==='token:'+tag && c.str.match(token)) {
        c.str=''
      }
    })
    this.push(chunk)
    callback()
  })
}

module.exports = hideToken
