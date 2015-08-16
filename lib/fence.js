
var through2 = require('through2')

/**
 * Fence a block frontspaces
 * for each new lines.
 * It will add as much as
 * provided spaceCnt to every lines
 * within the block.
 * It can receive a last argument
 * to specify the very fist line
 * frontspace size.
 *
 * To use after removeFrontSpace to tab-right a content.
 *
 * @returns {*}
 */
function fence(regularSpaceCnt, firstLineSpaceCnt) {
  if (firstLineSpaceCnt===null) {
    firstLineSpaceCnt = regularSpaceCnt
  }
  return function (buf) {
    var index = 0
    var lines = buf.split('\n')
    if (lines.length>1) {
      lines.forEach(function(line, lineIndex){
        var start = null
        line.forEach(function (c, i) {
          if (start===null && c.type==='text') {
            start = i
          }
        })
        var spaceCnt;
        if (lineIndex===0) {
          spaceCnt = firstLineSpaceCnt
        } else {
          spaceCnt = regularSpaceCnt
        }
        for (var i=0;i<spaceCnt;i++) {
          buf.splice(index+start, 0, {type: 'text', str: ' '})
        }
        index+=line.length()+spaceCnt
      })
    }
  }
}

module.exports = fence
