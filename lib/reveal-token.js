
var through2 = require('through2')
var chalk = require('chalk')

/**
 * Identifies all tokens
 * matching the given tag
 * And apply a colorizer
 *
 * @returns {*}
 */
function revealToken(tag, colorizer) {
  colorizer = colorizer || chalk.underline.red
  return through2.obj(function(chunk, enc, callback){
    chunk.forEach(function(c, i){
      if (c.type
        && c.type.match(/^(token)/)
        && c.type.match(tag)) {
        c.str = colorizer(c.str)
      }
    })
    this.push(chunk, enc)
    callback()
  })
}

module.exports = revealToken
