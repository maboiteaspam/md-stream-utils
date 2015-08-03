// push the content string of each token
var through2 = require("through2")
var _ = require("underscore")
module.exports = function toString (opts){
  opts = opts || {}

  var stdin = process.stdin;
  stdin.setRawMode( true );
  stdin.pause();
  stdin.setEncoding( 'utf8' );
  var size = process.stdout.getWindowSize()
  var height = size[1]
  var startLinePosition = 0
  var curLinesDisplayed = 0

  var wholeBuf = []
  var stream = through2.obj(function (data, enc, callback) {

    wholeBuf.push(data)

    curLinesDisplayed++

    if (curLinesDisplayed<height) {
      this.push(data)
    }

    callback()
  }, function(callback){

    //callback()
  })

  var moveUp = function(){
    if (startLinePosition>=0) {
      startLinePosition--
      var sub = wholeBuf.slice(startLinePosition, startLinePosition+height)
      sub.reverse().forEach(function (line, i) {
        require('readline').cursorTo(process.stdout,
          0, sub.length-i-1)
        require('readline').clearLine(process.stdout, 0)
        stream.push(line)
      })
    }
  }
  var moveDown = function(){
    if (startLinePosition+height<wholeBuf.length) {
      var sub = wholeBuf.slice(startLinePosition+height,
        startLinePosition+height+1)
      startLinePosition++
      sub.forEach(function (line) {
        stream.push(line)
      })
    }
  }
  listenStdin({
    '\u0003': function(){// ctrl-c ( end of text )
      process.exit();
    },
    '\u001bOA': moveUp,
    '\u001b[A': moveUp,
    '\u001bOB': moveDown,
    '\u001b[B': moveDown,
    '\u001bOD': function(){}, //left
    '\u001bOC': function(){} //right
  })
  stdin.resume()

  return stream
}


function listenStdin(keys){
  var fn = function( key ){
    if (key in keys) {
      keys[key]()
    }
  }
  process.stdin.on( 'data', fn);
  return fn
}