
var through2 = require('through2')

/**
 * Given a tokenized TokenString
 * Ensure its content is trimmed
 * of the given str.
 * dir can be left, right, both (default)
 *
 * @returns {*}
 */
function trimBlock(str, dir) {
  dir = dir || 'both'
  return function (buf) {
    if (['left', 'both'].indexOf(dir)>-1) buf.less(str)
    if (['right', 'both'].indexOf(dir)>-1) buf.tail(str)
  }
}

module.exports = trimBlock
