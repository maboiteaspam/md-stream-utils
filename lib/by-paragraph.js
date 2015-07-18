// pushes md-tokens by paragraph.
// it buffers tokens and pushes them as an array
// representing the content between two paragraphs.
// including new lines.
var through2 = require("through2")
var mdParagrpah = []
module.exports = function flatten (){
  return through2.obj(function (data, enc, callback) {
    if (data.length) {
      if (mdParagrpah.length && data[0].type.match(/heading/)) {
        callback(null, mdParagrpah)
        mdParagrpah = []
      }else{
        callback()
      }
      mdParagrpah = mdParagrpah.concat(data)
    } else {
      if (mdParagrpah.length && data.type.match(/heading/)) {
        callback(null, mdParagrpah)
        mdParagrpah = []
      }else{
        callback()
      }
      mdParagrpah = mdParagrpah.concat(data)
    }
  }, function (callback) {
    if (mdParagrpah.length) {
      this.push(mdParagrpah)
      mdParagrpah = []
    }
    callback()
  })
}
