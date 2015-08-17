
var through2 = require('through2')

/**
 * Given a tokenized TokenString
 * Ensure inner content type isset to text
 *
 * @returns {*}
 */
function cleanBlock(tokenEnd) {
  return function (buf) {
    var token = buf.filterType(/^start:/).first().tokenStr
    if (tokenEnd==null) {
      tokenEnd = token
    }
    buf.slice(1+token.length, -1-tokenEnd.length).forEach(function (c) {
      c.type = 'text'
    })
  }
}

module.exports = cleanBlock
