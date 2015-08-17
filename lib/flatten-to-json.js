
var through2 = require('through2')

/**
 * Flattens every structs to their JSON string
 * Useful to pipe to stdout or similar
 *
 * @returns {*}
 */
function flattenToJson(){
  return through2.obj(function (chunk, enc, callback) {
    this.push(JSON.stringify(chunk)+'\n')
    callback()
  })
}

module.exports = flattenToJson
