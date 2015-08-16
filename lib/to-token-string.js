
var through2 = require('through2')
var _ = require('underscore')
var TokenString = require('./token-string.js')

/**
 * Build struct of a string for markup parsing
 *
 * @returns {*}
 */
function toTokenString(){
  return through2.obj(function (chunk, enc, callback) {
    for (var i = 0; i < chunk.length; i++){
      var str;
      if (_.isString(chunk)) {
        str = chunk[i].toString('utf8');
      } else {
        str = chunk.toString('utf8', i, i+1)
      }
      var t = new TokenString()
      t.append({type: 'text', str: str})
      this.push(t)
    }
    callback()
  })
}


module.exports = toTokenString