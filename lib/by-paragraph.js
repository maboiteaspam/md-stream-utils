// pushes md-tokens by paragraph.
// it buffers tokens and pushes them as an array
// representing the content between two paragraphs.
// including new lines.
var through2 = require("through2")
var mdParagraph = []
module.exports = function byParagraph (){
  return through2.obj(function (data, enc, callback) {
    if (data.length) {
      if (mdParagraph.length && data[0].type.match(/heading/)) {
        callback(null, mdParagraph)
        mdParagraph = []
      }else{
        callback()
      }
      mdParagraph = mdParagraph.concat(data)
    } else {
      if (mdParagraph.length && data.type.match(/heading/)) {
        callback(null, mdParagraph)
        mdParagraph = []
      }else{
        callback()
      }
      mdParagraph = mdParagraph.concat(data)
    }
  }, function (callback) {
    if (mdParagraph.length) {
      this.push(mdParagraph)
      mdParagraph = []
    }
    callback()
  })
}
