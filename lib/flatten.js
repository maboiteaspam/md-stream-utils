// flattens a stream of md tokens
// if it receives an array of tokens, push each tokens
// if it s already flattened token, push it.
var through2 = require("through2")
module.exports = function flatten (){
  return through2.obj(function (data, enc, callback) {
    var that = this
    if (data.length) {
      data.forEach(function (d){
        that.push(d)
      })
    } else {
      this.push(data)
    }
    callback()
  })
}
