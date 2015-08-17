
var through2 = require('through2')

/**
 * Surround a given block content
 * with open / close str
 *
 *
 * @returns {*}
 */
function surroundBlockContent(open, close) {
  return function (buf) {
    var head = buf.unshift()
    var foot = buf.pop()
    open.split('').forEach(function(c){
      buf.prepend({type: 'text', str: c})
    })
    buf.prepend(head)
    close.split('').forEach(function(c){
      buf.append({type: 'text', str: c})
    })
    buf.append(foot)
  }
}

module.exports = surroundBlockContent
