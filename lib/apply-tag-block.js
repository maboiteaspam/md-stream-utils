
var through2 = require('through2')
var _ = require('underscore')
RegExp = require('./regexp-quote.js')

/**
 * Identifies among the stream
 * the strings starting and ending with
 * the given str.
 * It inserts a pre start node,
 * before the opening tokens.
 * And a post end node,
 * after the closing tokens.
 *
 * Tokens can allow new lines.
 *
 * It packs the string,
 * then push the newly detected block.
 *
 * @returns {*}
 */
function applyTagBlock(tag, str, allowNewLines) {
  var okStr = _.isString(str) ? RegExp.quote(str) : str

  var blockBuf
  return through2.obj(function(chunk, enc, callback){

    var that = this

    while (chunk.match(okStr)) {
      var head = chunk.lessUntilMatch(okStr)
      if (!blockBuf && head.length()) that.push(head)
      else if(blockBuf) blockBuf.concat(head.splice(0))

      var tokens = chunk.lessMatch(okStr)
      if (tokens.filterType(/^token:/).length()) {
        if(blockBuf) blockBuf.concat(tokens.splice(0))
        else that.push(tokens)

      }else if (!blockBuf){
        blockBuf = tokens.splice(0)
        var body = chunk.lessUntilMatch(okStr)
        if (body.length()) blockBuf.concat(body)
        else blockBuf.concat(chunk.splice(0))

      }else if (blockBuf){
        blockBuf.concat(tokens)
        var preTokens = blockBuf.lessMatch(okStr)
        var postTokens = blockBuf.tailMatch(okStr)

        if (allowNewLines || !blockBuf.match(/\n/)) {
          preTokens.forEach(function(c){
            c.type = 'token:' + tag
          }).prepend({type:'start:'+tag,
            power: preTokens.filterType('token:' + tag).length(),
            tokenStr: preTokens.filterType('token:' + tag).toString(),
            str:''})
          postTokens.forEach(function(c){
            c.type = 'token:' + tag
          }).append({type:'end:'+tag,
            power: postTokens.filterType('token:' + tag).length(),
            tokenStr: postTokens.filterType('token:' + tag).toString(),
            str:''})
        }

        preTokens.concat(blockBuf.splice(0))
        preTokens.concat(postTokens.splice(0))
        that.push(preTokens)
        blockBuf=null
      }

    }

    if (blockBuf) {
      if(!allowNewLines && chunk.match(/\n/)) {
        that.push(blockBuf.splice(0))
        that.push(chunk.splice(0))
        blockBuf = null
      } else {
        blockBuf.concat(chunk.splice(0))
      }
    }
    if (chunk.length()) that.push(chunk)

    callback()

  }, function (callback) {
    if (blockBuf) {
      this.push(blockBuf)
      blockBuf=null
    }
    callback()
  })
}

module.exports = applyTagBlock
