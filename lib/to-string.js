// push the content string of each token
var through2 = require("through2")
var _ = require("underscore")
module.exports = function toString (opts){
  opts = opts || {}
  var lastData = null
  return through2.obj(function (data, enc, callback) {
    if (_.isArray(data)) {
      var s = ''
      data.forEach(function(d){s+= d.content})
      data = {
        content: s
      }
    }else if (_.isString(data)) {
      data = {
        content: data
      }
    }
    if (opts.prepend) {
      data.content = opts.prepend+data.content
    }
    if (opts.append) {
      data.content = data.content+opts.append
    }
    lastData = data.content
    this.push(data.content)
    callback()
  }, function (callback) {
    if (opts.properEnding) {
      if (lastData && !lastData.match(/\n$/)) {
        this.push('\n')
      }
    }
    callback()
  })
}
