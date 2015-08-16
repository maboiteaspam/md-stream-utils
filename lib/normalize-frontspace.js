
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
    var len = 0
    var lines = buf.filterType('text').split('\n')
    var m = lines[0].match(/^(\s+)/)
    if (!m && lines.length>1) {
      m = lines[1].match(/^(\s+)/)
    }
    if (m) {
      len = m[1].length
    }

    var index = 0
    buf.split('\n').forEach(function(line){
      var e = 0
      line.forEach(function (c, i) {
        if (c.str.match(/[ ]/)) {
          if (e<len ) {
            var t = buf.splice(index, 1)
            index--
          }
          e++
        }
        index++
      })
    })

  }
}

module.exports = normalizeFrontSpace
