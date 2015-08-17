
var through2 = require('through2')
var _ = require('underscore')
var TokenString = require('./token-string.js')

/**
 * pushes md-tokens by paragraph.
 * it buffers tokens and pushes them as an array
 * representing the content between two paragraphs.
 * including new lines.
 *
 * @returns {*}
 */
module.exports = function byParagraph (p){
  var mdParagraph = new TokenString()
  return through2.obj(function (data, enc, callback) {
    var that = this
    data.forEach(function (c) {
      if (c.type.match(/start:heading/) && (c.power === p || !_.isNumber(p))) {
        var t = mdParagraph.splice(0)
        if (t.length()) that.push(t)
      }
      mdParagraph.append(c)
      if (c.type.match(/end:heading/) && (c.power === p || !_.isNumber(p))) {
        var t = mdParagraph.splice(0)
        if (t.length()) that.push(t)
      }
    })
    callback()
  }, function (callback) {
    if (mdParagraph.length()) {
      this.push(mdParagraph.splice(0))
    }
    callback()
  })
}