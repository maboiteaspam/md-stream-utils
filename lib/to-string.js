// push the content string of each token
var through2 = require("through2")
var _ = require("underscore")
module.exports = function toString (opts){
  opts = opts || {}
  return through2.obj(function (data, enc, callback) {
    if (_.isArray(data)) {
      data = {
        content: data.join('')
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
    this.push(data.content)
    callback()
  })
}
