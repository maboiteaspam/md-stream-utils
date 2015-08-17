
var through2 = require('through2')
var TokenString = require('./token-string.js')

/**
 * Identifies among the stream
 * the starting list item nodes.
 * Ensure their end nodes is right positioned,
 * before the next start list item node,
 * or before the next \n\n sequence.
 *
 * use it right after a multiline
 * block detection with applyLineBlock.
 *
 * @returns {*}
 */
function regroupListItemsLines() {
  var t = new TokenString();
  var p
  var isInBlock = false
  return through2.obj(function(chunk, enc, callback){
    var that = this
    chunk.forEach(function (c,i){
      if (c.type.match(/^start:list/)) {
        if (isInBlock) {
          var postNl;
          if (t.match(/\n$/)) {
            postNl = t.pop()
          }
          if (p) t.append(p)
          if (postNl) t.append(postNl)
        }
        that.push(t.splice(0))
        isInBlock = true
      } else if (c.str.match(/\n/)) {
        if (isInBlock) {
          if (t.match(/\n$/)) {
            var postNl = t.pop()
            t.append(p)
            t.append(postNl)
            t.append(c)
            that.push(t.splice(0))
            isInBlock = false
          }
        }
      }

      if (isInBlock) {
        if (c.type.match(/^end:list/)) {
          p = c
        } else {
          t.append(c)
        }
      } else {
        t.append(c)
      }
    })

    if (!isInBlock) {
      that.push(t.splice(0))
    }

    callback()
  }, function (callback) {
    if (t) {
      var postNl;
      if (t.match(/\n$/)) {
        postNl = t.pop()
      }
      if (p) t.append(p)
      if (postNl) t.append(postNl)
      this.push(t.splice(0))
    }
    callback()
  })
}

module.exports = regroupListItemsLines
