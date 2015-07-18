// filters the tokens.
var through2 = require("through2")
module.exports = function filter (how){
  return through2.obj(function (data, enc, callback) {
    if (data.length) {
      if (how.type && data[0].type.match(how.type) ) {
        pass = true
      }
      if (how.content && data.join('').match(how.content)) {
        pass = true
      }
      if (pass) {
        this.push(data)
      }
    } else {
      var pass = false
      if (how.type && data.type.match(how.type) ) {
        pass = true
      }
      if (how.content && data.content.match(how.content)) {
        pass = true
      }
      if (pass) {
        this.push(data)
      }
    }
    callback()
  })
}
