
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
    var lines = buf.splice(0).split('\n')
    lines.forEach(function(line, lineIndex){
      var spaceCnt;
      if (lineIndex===0 && lines.length>1) {
        spaceCnt = firstLineSpaceCnt
      } else {
        spaceCnt = regularSpaceCnt
      }
      for (var i=0;i<spaceCnt;i++) {
        line.prependStr(' ')
      }
      buf.concat(line.splice(0))
    })
  }
}

module.exports = fence
