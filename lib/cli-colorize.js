// colorize md-tokens for cli output.
var chalk = require("chalk")
var through2 = require("through2")
module.exports = function colorize (){

  var mode = 'text'

  var processToken = function (d){
    if (d.type.match(/heading/) ) {
      process.stdout.write( chalk.green(d.content) )
      mode = 'heading'
    } else if (d.type.match(/list item/) ) {
      process.stdout.write( chalk.cyan(d.content) )
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
        process.stdout.write(d.content)
      } else {
        process.stdout.write(chalk.bold.white(d.content))
      }
    }else if (mode === 'code') {
      process.stdout.write(chalk.white(d.content))
    }else if (mode === 'underline') {
      process.stdout.write(chalk.underline(d.content))
    }else if (mode === 'star') {
      process.stdout.write(chalk.bold(d.content))
    }else if (mode === 'emphasis') {
      process.stdout.write(chalk.underline.bold(d.content))
    }else if (mode === 'text') {
      process.stdout.write(d.content)
    }
  };

  return through2.obj(function (data, enc, callback) {
    if (data.length) {
      data.forEach(processToken)
    } else {
      processToken(data)
    }
    callback()
  })
}
