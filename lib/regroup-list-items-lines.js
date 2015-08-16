
var through2 = require('through2')

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
  var regroupLines = function (lines){
    if (lines.split(/\n/).length>1) {
      var g = lines.lastIndexOfType('end:listitem')
      var end = lines.splice(g, 1).first()
      var insertIndex;
      lines.forEachReversed(function (c,i) {
        if (!insertIndex  && !c.str.match(/\s/)) {
          insertIndex = i
        }
      });
      if (insertIndex) {
        lines.insert(insertIndex, end)
      } else {
        lines.append(end)
      }
    }
  }
  var t;
  var isInBlock = false
  return through2.obj(function(chunk, enc, callback){
    if (!isInBlock && chunk.first().type.match(/^start:listitem/)) {
      isInBlock = true
      t = chunk
    } else if (isInBlock){

      if (chunk.first().type.match(/^start:listitem/)) {
        regroupLines(t)
        this.push(t)
        t = chunk
      } else {
        t.concat(chunk)
        if (t.match(/\n\n$/)) {
          regroupLines(t)
          this.push(t)
          isInBlock = false
          t = null
        } else {
          //console.log(chunk.tokens)
        }
      }

    } else {
      this.push(chunk, enc)
    }
    callback()
  })
}

module.exports = regroupListItemsLines
