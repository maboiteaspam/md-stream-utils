
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
function applyLineBlock(tag, token) {
  return through2.obj(function(chunk, enc, callback){
    if(chunk.strLength()>1) {
      var tokenMatch = chunk.match(RegExp.fromStr(token))
      if ( tokenMatch && tokenMatch.length) {
        if ( !chunk.slice(tokenMatch.index, tokenMatch[0].length).filterType('token:').length()) {
          var postNl = chunk.pop()
          var e = 0
          chunk.forEach(function(c, i){
            if (i>=tokenMatch.index
              && !c.type.match(/token:/)
              && c.str===tokenMatch[1][e]
              && e<tokenMatch[1].length) {
              c.type = 'token:'+tag
              e++
            }
          }).prepend({type:'start:'+tag, power: tokenMatch[1].length, tokenStr: tokenMatch[1]})
            .append({type:'end:'+tag, power: tokenMatch[1].length, tokenStr: tokenMatch[1]})
          if (postNl) chunk.append(postNl)

        }
      }
    }
    this.push(chunk, enc)
    callback()
  })
}

module.exports = applyLineBlock
