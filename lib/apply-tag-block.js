
var through2 = require('through2')
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
  var okStr = RegExp.quote(str)

  var startToken = '['+okStr + ']{'+str.length+'}[^'+okStr+']+'
  var endToken = '['+okStr + ']{'+str.length+'}[^'+okStr+']+['+okStr + ']{'+str.length+'}[^'+okStr+']*$'

  var beginToken = new RegExp('^'+startToken)
  startToken = '^\\s+' + startToken
  endToken = '\\s+' + endToken
  startToken = new RegExp(startToken)
  endToken = new RegExp(endToken)

  var applyToken = function (tokenStr) {
    var e = 0
    tokenStr.forEach(function (c, i) {
      if (tokenStr.filterType('token:'+tag).length()<str.length) {
        if(str[e] && c.str===str[e]) {
          c.type = 'token:'+tag
          e++
        }
      }
    })
    e = str.length-1
    tokenStr.forEachReversed(function (c) {
      if (tokenStr.filterType('token:'+tag).length()<str.length*2) {
        if(str[e] && c.str===str[e]) {
          c.type = 'token:'+tag
          e--
        }
      }
    })

    tokenStr.insert(tokenStr.lastIndexOfType('token:'+tag)+1,
      {type:'end:'+tag, power: str.length, tokenStr: str, str:''})
    tokenStr.insert(tokenStr.indexOfType('token:'+tag),
      {type:'start:'+tag, power: str.length, tokenStr: str, str:''})
  }

  var browsed = 0;
  var t; // should be a TokenString
  return through2.obj(function(chunk, enc, callback){
    if (!t && chunk.match(browsed===0?beginToken:startToken)
      && !chunk.filterType('token:'+tag).length()) {
      t = chunk
      if (t.match(endToken)) {
        applyToken(t)
        this.push(t)
        t=null
      } else {
      }
    } else if (t){
      //if (chunk.filterType('token:'+tag).length()) console.log(chunk.tokens)
      t.concat(chunk)
      if (!allowNewLines && chunk.match(/\n/)) {
        this.push(t)
        t=null

      } else if (t.match(endToken)) {
        applyToken(t)
        this.push(t)
        t=null
      } else {
      }
    } else {
      this.push(chunk)
    }

    browsed++
    callback()

  }, function (callback) {
    if (t) {
      this.push(t)
      t=null
    }
    callback()
  })
}

module.exports = applyTagBlock
