
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
function fence(fn, wspace) {
  wspace = wspace || ' ';
  return function (buf) {
    var spaceCnt = fn(buf);
    var lines = buf.splice(0).split('\n')
    lines.forEach(function(line, lineIndex){
      var s = spaceCnt[0]
      if (lineIndex===0 && spaceCnt.length) {
        s = spaceCnt[1]
      }
      for (var i=0;i<s;i++) {
        line.prependStr(wspace)
      }
      buf.concat(line.splice(0))
    })
  }
}

module.exports = fence
