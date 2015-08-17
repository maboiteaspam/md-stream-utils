
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
    chunk.forEach(function(c){
      if (c.style) {
        var colorizer = chalk;
        Object.keys(c.style).forEach(function(style){
          if (c.style[style]>0) {
            colorizer = colorizer[style];
          }
        });
        c.str = colorizer(c.str)
      }
    });
    this.push(chunk)
    callback()
  })
}

module.exports = resolveColors
