// colorize md-tokens for cli output.
var chalk = require("chalk")
var through2 = require("through2")
module.exports = function colorize (){

  var mode = 'text'

  var processToken = function (d){
    var text = false
    if (d.type.match(/heading/) ) {
      text = chalk.green(d.content)
      mode = 'heading'

    } else if (d.type.match(/list item/) ) {
      text = chalk.cyan(d.content)

    } else if (d.type.match(/code/) ) {
      if(mode==='code') mode = 'text'
      else mode = 'code'

    } else if (d.type.match(/underline/) ) {
      if(mode==='underline') mode = 'text'
      else mode = 'underline'

    } else if (d.type.match(/star/) ) {
      if(mode==='star') mode = 'text'
      else mode = 'star'

    } else if (d.type.match(/emphasis/) ) {
      if(mode==='emphasis') mode = 'text'
      else mode = 'emphasis'

    }else if (mode === 'heading') {
      if (d.type.match(/new line/) ) {
        mode = 'text'
        text = d.content
      } else {
        text = chalk.bold.white(d.content)
      }
    }else if (mode === 'code') {
      text = chalk.white(d.content)

    }else if (mode === 'underline') {
      text = chalk.underline(d.content)

    }else if (mode === 'star') {
      text = chalk.bold(d.content)

    }else if (mode === 'emphasis') {
      text = chalk.underline.bold(d.content)

    }else if (mode === 'text') {
      text = d.content
    }
    return text
  };

  return through2.obj(function (data, enc, callback) {
    if (data.length) {
      var that = this
      var newData = []
      data.forEach(function(d){
        var text = processToken(d)
        if (text) {
          d.content = text
          newData.push(d)
        }
      })
      that.push (newData)
    } else {
      var text = processToken(data)
      if (text) {
        data.content = text
        this.push (data)
      }
    }
    callback()
  })
}
