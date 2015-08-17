
var through2 = require('through2')

/**
 * Given a multiline TokenString
 * Identify the first line frontspace dimension
 * Tab left of the same dimension every following lines
 *
 * To use before fence to tab-left a content
 * before tab-right a content to its final display.
 *
 * @returns {*}
 */
function normalizeFrontSpace() {
  return function (buf) {
    var lines = buf.split('\n')
    var firstFrontSpace = ''
    var m = lines[0].match(/^(\s+)/)
    if (!m && lines.length>1) {
      m = lines[1].match(/^(\s+)/)
    }
    if (m) {
      firstFrontSpace = m[1]
    }

    if (firstFrontSpace) {
      buf.split('\n').forEach(function(line){
        line.lessMatch(firstFrontSpace)
      })
    }

  }
}

module.exports = normalizeFrontSpace
