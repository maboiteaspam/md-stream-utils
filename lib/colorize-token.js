
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
  var open = '';
  var close = '';
  colorizer._styles.forEach(function(style){
    open += chalk.styles[style].open
    close = chalk.styles[style].close + close
  })
  return function(buf) {
    var tag = buf.first().type.split(':')[1]
    buf.filterType('token:'+tag).forEach(function(c){
      c.prepend = open
      c.append = close
    })
  }
}

module.exports = colorizeToken
