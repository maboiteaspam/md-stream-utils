// pushes md-tokens by line.
// it buffers tokens and pushes them as an array
// representing the content between two lines.
var _ = require("underscore")
var through2 = require("through2")
var mdBlock = []
module.exports = function flatten (){
  return through2.obj(function (data, enc, callback) {
    var that = this
    var pushBlock = function(){
      if (mdBlock.length) {
        that.push(mdBlock)
        mdBlock = []
      }
    };
    if (data.type.match(/code block/i)) {
      if (_.where(mdBlock, {type: "code block"}).length) {
        mdBlock.push(data)
        pushBlock()
      }else{
        pushBlock()
        mdBlock.push(data)
      }

    } else if (data.type.match(/list item ordered/i)) {
      pushBlock()
      mdBlock.push(data)

    } else if (data.type.match(/list item dash/i)) {
      pushBlock()
      mdBlock.push(data)

    } else if (data.type.match(/heading/i)) {
      pushBlock()
      mdBlock.push(data)

    } else if (data.type.match(/new line/i)) {
      if (_.where(mdBlock, {type: "heading"}).length) {
        pushBlock()
      }
      mdBlock.push(data)
    } else {
      mdBlock.push(data)
    }
    callback()
  }, function (callback) {
    if (mdBlock.length) {
      this.push(mdBlock)
      mdBlock = []
    }
    callback()
  })
}
