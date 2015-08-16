
var through2 = require('through2')

/**
 * Controls the length
 * of every chunk passing in the stream
 * emit a warning on stderr when it exceeds max.
 *
 * This is very useful to visualize a
 * transform that buffers too much data.
 *
 * @returns {*}
 */
function controlLength(max, extra) {
  return through2.obj(function(chunk, enc, callback){
    if(chunk.strLength()>max) {
      console.error('------------ ' + (extra || '') + ' ' +chunk.strLength())
      console.error( chunk.toString())
    }
    this.push(chunk)
    callback()
  })
}

module.exports = controlLength
