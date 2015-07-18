// push the content string of each token
var through2 = require("through2")
module.exports = function toString (opts){
  opts = opts || {}
  return through2.obj(function (data, enc, callback) {
    if (data.length) {
      data = {
        content: data.join('')
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
