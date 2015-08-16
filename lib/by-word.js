
var through2 = require('through2')
var TokenString = require('./token-string.js')

/**
 * Split given TokenString
 * by \s to pack and push lines.
 * whitespace can be pre,post,both,false
 * and indicates if they should be
 * included in the resulting packed strings.
 *
 * @returns {*}
 */
function byWord(whitespace) {
  var t; // should be a TokenString
  return through2.obj(function(chunk, enc, callback){
    var that = this
    if (!t) {
      t = chunk
    } else {
      t.concat(chunk)
    }

    if (t.match(/\s/)) {
      var w = new TokenString()
      t.forEach(function (l) {
        if (!whitespace) {
          if (w.length()) {
            if (l.str.match(/\s/)) {
              if (w.match(/\S+/)) {
                that.push(w)
                w = new TokenString()
              }
            } else {
              if (w.match(/\s+/)) {
                that.push(w)
                w = new TokenString()
              }
            }
          }
        } else if(whitespace==='pre') {
          if (w.length()) {
            if (l.str.match(/\s/) && w.match(/\S+/)) {
              that.push(w)
              w = new TokenString()
            }
          }
        }

        w.append(l)

        if(whitespace==='post') {
          if (l.str.match(/\s/) && w.match(/\S+/)) {
            that.push(w)
            w = new TokenString()
          }
        }
      })
      t.clear()
      t.concat(w)
    }

    callback()

  }, function (callback) {
    if (t) {
      this.push(t)
      t=null
    }
    callback()
  })
}

module.exports = byWord
