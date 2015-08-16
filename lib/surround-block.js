
var through2 = require('through2')

/**
 * Surround a given block
 * with open / close str.
 * It inserts strings
 * before and after
 * start/end nodes.
 *
 * @returns {*}
 */
function surroundBlock(open, close) {
  return function (buf) {
    open.split('').forEach(function(c){
      buf.prepend({type: 'text', str: c})
    })
    close.split('').forEach(function(c){
      buf.append({type: 'text', str: c})
    })
  }
}

module.exports = surroundBlock
