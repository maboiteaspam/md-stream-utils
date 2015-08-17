
var through2 = require('through2')
var chalk = require('chalk')

/**
 * Apply colorizer chalk styles
 * to every tokens matching text type
 *
 * @returns {*}
 */
function colorizeContent(colorizer) {
  return function(buf) {
    var head = buf.lessUntilType('text')
    var foot = buf.tailUntilType('text')
    buf.filterNotType(/^token:/).forEach(function(c){
      c.style = c.style || {};
      colorizer._styles.forEach(function(style){
        if (!c.style[style]) c.style[style] = 0
        c.style[style]++
      })
    })

    head.concat(buf.splice(0)).concat(foot.splice(0));
    buf.concat(head.splice(0))
  }
}

module.exports = colorizeContent
