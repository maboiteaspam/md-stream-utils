
var through2 = require('through2')

/**
 * Removes all frontspaces
 * of each new lines
 * hits in the given TokenString
 *
 * @returns {*}
 */
function removeFrontSpace() {
  return function (buf) {
    var index = 0
    buf.split('\n').forEach(function(line){
      var keepRemove = true
      line.forEach(function (c, i) {
        if (c.type==='text') {
          if (keepRemove && c.str.match(/[ ]/)) {
            buf.splice(index, 1)
            index--
          } else if(keepRemove && c.str.length) {
            keepRemove = false
          }
        }
        index++
      })
    })

  }
}

module.exports = removeFrontSpace
