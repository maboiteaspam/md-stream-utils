// push the content string of each token
var through2 = require("through2")
var _ = require("underscore")
module.exports = function toJSON (opts) {
  opts = opts || {}
  return through2.obj(function (data, enc, callback) {
    if (opts.prepend) {
      this.push(opts.prepend)
    }
    if (_.isArray(data)) {
      var that = this
      data.forEach(function(d){
        if (opts.prepend) that.push(opts.prepend)
        that.push(JSON.stringify(d, opts.replacer, opts.space))
        if (opts.append) that.push(opts.append)
      })
    }else if (_.isString(data)) {
      data = {
        content: data
      }
      if (opts.prepend) this.push(opts.prepend)
      this.push(JSON.stringify(data, opts.replacer, opts.space))
      if (opts.append) this.push(opts.append)
    } else {
      if (opts.prepend) this.push(opts.prepend)
      this.push(JSON.stringify(data, opts.replacer, opts.space))
      if (opts.append) this.push(opts.append)
    }
    callback()
  })
}
