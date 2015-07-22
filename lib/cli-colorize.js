// colorize md-tokens for cli output.
var chalk = require("chalk")
var through2 = require("through2")
var _ = require('underscore')
module.exports = function colorize (){

  var modes = [];

  var processToken = function (d){
    var text = false

    if (d.type.match(/new line/) && modes.indexOf('heading')>-1 ) {
      modes = _.without(modes, 'heading')
      text = d.content

    } else if (d.type.match(/heading/) ) {
      text = chalk.green(d.content)
      modes.push('heading')

    } else if (d.type.match(/list item/) ) {
      text = chalk.blue(d.content)

    } else if (d.type.match(/code/) ) {
      if (modes.indexOf('italic')>-1) modes = _.without(modes, 'italic')
      else modes.push('italic')

    } else if (d.type.match(/underline/) ) {
      if (modes.indexOf('underline')>-1) modes = _.without(modes, 'underline')
      else modes.push('underline')

    } else if (d.type.match(/star/) ) {
      if (modes.indexOf('bold')>-1) modes = _.without(modes, 'bold')
      else modes.push('bold')

    } else if (d.type.match(/emphasis/) ) {
      if (modes.indexOf('bold')>-1) modes = _.without(modes, 'bold')
      else modes.push('bold')

    } else {
      text = d.content
      var painter = chalk.reset
      modes.forEach(function(m){
        if (m==='heading') painter = painter.bold.white
        else painter = painter[m]
      })
      text = painter(text)
    }
    return text
  };

  return through2.obj(function (data, enc, callback) {
    if (data.length) {
      var newData = []
      data.forEach(function(d){
        var text = processToken(d)
        if (text) {
          d.content = text
          newData.push(d)
        }
      })
      this.push (newData)
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
