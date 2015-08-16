
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
      if (head.length()) that.push(head)
      var tokens = chunk.lessMatch(okStr)
      if (tokens.filterType(/token/).length()) {
        that.push(tokens)
      }else if (!blockBuf){
        blockBuf = tokens.splice(0)
        var body = chunk.lessUntilMatch(okStr)
        blockBuf.concat(body)
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
