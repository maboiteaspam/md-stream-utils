
var through2 = require('through2')
var chalk = require('chalk')

/**
 * Apply colorizer chalk styles
 * to every tokens matching text type
 *
 * @returns {*}
 */
function colorizeContent(colorizer) {
  var open = '';
  var close = '';
  colorizer._styles.forEach(function(style){
    open += chalk.styles[style].open
    close = chalk.styles[style].close + close
  })
  return function(buf) {
    var text = buf.filterType('text');
    var tag = buf.first().type.split(':')[1]
    if (text.first()) {
      text.first().prepend = (text.first().prepend||'') + open
      text.last().append = close + (text.last().append||'')
    }
    buf.filterType(/^end:/).filterNotType('end:'+tag).forEach(function(c, i){
      c.prepend = (c.prepend||'') + open
    })
    buf.filterStr(/\n/).forEach(function(c, i){
      c.prepend = (c.prepend||'') + open
    })
    buf.last().prepend = close + (buf.last().prepend||'')
  }
}

module.exports = colorizeContent
