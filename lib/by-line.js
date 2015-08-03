// pushes md-tokens by line.
// it buffers tokens and pushes them as an array
// representing the content between two lines.
var through2 = require("through2")
var mdLine = []
module.exports = function byLine (){
  return through2.obj(function (data, enc, callback) {
    mdLine.push(data)
    if (data.type.match(/new line/i)) {
      this.push([].concat(mdLine))
      mdLine = []
    }
    callback()
  }, function (callback) {
    if (mdLine.length) {
      this.push([].concat(mdLine))
      mdLine = []
    }
    callback()
  })
}
