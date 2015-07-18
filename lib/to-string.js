// push the content string of each token
var through2 = require("through2")
module.exports = function toString (opts){
  return through2.obj(function (data, enc, callback) {
    if (data.length) {
      var that = this
      data.forEach(function (d, i) {
        if (i===0 && opts.prepend) {
          that.push(opts.prepend+d.content)
        } else if (i===data.length-1 && opts.append) {
          that.push(d.content+opts.append)
        } else {
          that.push(d.content)
        }
      })
    } else {
      if (opts.prepend) {
        data.content = opts.prepend+data.content
      }
      if (opts.append) {
        data.content = data.content+opts.append
      }
      this.push(data.content)
    }
    callback()
  })
}
