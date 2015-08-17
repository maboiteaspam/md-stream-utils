
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
  var first = true
  return through2.obj(function(chunk, enc, callback){
    var that = this
    if (!t) {
      t = chunk
    } else {
      t.concat(chunk)
    }

    var w = new TokenString()
    if (!whitespace) {
      if (t.match(/\s/)) {
        t.forEach(function (l) {
          if (l.str.match(/\s/) && w.match(/\S+/)) {
            that.push(w)
            w = new TokenString()
          } else if(l.str.match(/\S/) && w.match(/\s+/)){
            that.push(w)
            w = new TokenString()
          }
          w.append(l)
        })
        t.clear()
        t.concat(w)
      }

    } else if (whitespace==='pre') {
      if (t.match(/\s/)) {
        t.forEach(function (l) {
          if (l.str.match(/\s/)) {
            if(w.length() && w.match(/\S/)) {
              that.push(w)
              w = new TokenString()
            }
          }
          w.append(l)
        })
        t.clear()
        t.concat(w)
      }

    } else if (whitespace==='post') {
      if (t.match(/\s/)) {
        t.forEach(function (l) {
          if (l.str.match(/\S/)) {
            if(w.length() && w.match(/\s$/)) {
              that.push(w)
              w = new TokenString()
            }
          }
          w.append(l)
        })
        t.clear()
        t.concat(w)
      }

    } else if (whitespace==='both') {
      if (t.match(/\s/)) {
        t.forEach(function (l) {
          w.append(l)
          if (l.str.match(/\s/)) {
            if (first && w.match(/^\S/)) {
              var foot = w.tail(/\s/)
              first = false
              if(w.length()) that.push(w)
              w = new TokenString()
              if(foot.length()) w.concat(foot)
            }

            if(w.length() && w.match(/\S\s$/)) {
              var frontspace = w.lessUntil(/\s\S/)
              var endspace = w.tailUntil(/\S\s/)
              if(frontspace.length()) that.push(frontspace)
              if(w.length()) that.push(w)
              if(endspace.length()) that.push(endspace)
              w = new TokenString()
            }
          }
        })
        t.clear()
        t.concat(w)
      }
    }


    callback()

  }, function (callback) {
    if (t) {
      if(t.length()) this.push(t)
      t=null
    }
    callback()
  })
}

module.exports = byWord
