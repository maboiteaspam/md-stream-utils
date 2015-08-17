
var through2 = require('through2')
var chalk = require('chalk')

/**
 * Apply colorizer chalk styles
 * to every tokens matching text type
 *
 * @returns {*}
 */
function resolveColors() {
  return through2.obj(function(chunk, enc, callback){
    chunk.forEach(resolveColors.transform);
    this.push(chunk)
    callback()
  })
}
resolveColors.transform = function (c){
  var s = c.str
  if (c.style) {
    var colorizer = chalk;
    Object.keys(c.style).forEach(function(style){
      if (c.style[style]>0) {
        colorizer = colorizer[style];
      }
    });
    s = colorizer(s)
  }
  return s
}

module.exports = resolveColors
