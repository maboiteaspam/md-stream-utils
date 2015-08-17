
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
    buf.splice(0).split('\n').forEach(function(line){
      line.lessUntilMatch(/\S/);
      buf.concat(line)
    })
  }
}

module.exports = removeFrontSpace
