
var through2 = require('through2')
var _ = require('underscore')
var TokenString = require('./token-string.js')

/**
 * Split given TokenString
 * to a max length
 *
 * @returns {*}
 */
function maxLength(maxLen, insertString) {
  maxLen = !_.isFunction(maxLen) ? function(){return maxLen;} : maxLen;
  return function (buf) {
    var t = buf.splice(0)
    do{
      var k = t.spliceStr(0, maxLen());
      if (k.length()) {
        var y = k.tailUntilMatch(/\s/)
        if (insertString && !k.last().str.match(insertString)) {
          k.appendStr(insertString)
        }
        buf.concat(k)
        y.reverse().forEach(function(c){t.prepend(c)})
      }
    } while(t.length())
  }
}

module.exports = maxLength
