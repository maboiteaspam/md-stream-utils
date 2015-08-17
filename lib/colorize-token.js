
var through2 = require('through2')
var chalk = require('chalk')

/**
 * Apply colorizer chalk styles
 * to every tokens matching tag type
 * excluding start|end
 *
 * @returns {*}
 */
function colorizeToken(colorizer) {
  return function(buf) {
    var tag = buf.first().type.split(':')[1]
    buf.filterType('token:'+tag).forEach(function(c){
      c.style = c.style || {};
      colorizer._styles.forEach(function(style){
        if (!c.style[style]) c.style[style] = 0
        c.style[style]++
      })
    })
  }
}

module.exports = colorizeToken
