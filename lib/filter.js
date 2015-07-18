// filters the tokens.
var through2 = require("through2")
module.exports = function filter (how){
  return through2.obj(function (data, enc, callback) {
    var pass = true
    if (data.length) {
      if (how.type && !data[0].type.match(how.type) ) {
        pass = false
      }
      if (how.content && !data.join('').match(how.content)) {
        pass = false
      }
      if (pass) {
        this.push(data)
      }
    } else {
      if (how.type && !data.type.match(how.type) ) {
        pass = false
      }
      if (how.content && !data.content.match(how.content)) {
        pass = false
      }
      if (pass) {
        this.push(data)
      }
    }
    callback()
  })
}
