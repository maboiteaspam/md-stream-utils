
var through2 = require('through2')
var _ = require('underscore')
var TokenString = require('./token-string.js')

function less(pumpable) {

  var stdin = process.stdin;
  stdin.setRawMode( true );
  stdin.pause();
  stdin.setEncoding( 'utf8' );
  var size = process.stdout.getWindowSize()
  var height = size[1]
  var width = size[0]

  var pumpMoreLines = function(lines){
    var f = 1
    if (!pumpable.keepPump) {
      pumpable.pumpUntil(function(c){
        var h = c.match(/\n/)
        if (h) {
          f+= h.length
        }
        return f>lines
      })
      pumpable.resume()
    }
  }

  pumpMoreLines(height+1)

  var wholeBuf = new TokenString()
  var curPosition = 0
  var printToScreen = function(p){
    var h = 0
    var w = 0
    var str = new TokenString()
    wholeBuf.forEach(function (c) {
      w+= c.str.length;
      if (c.str.match(/\n/)) {
        w = 0
        h++
      }
      if (w>width) {
        w = 0
        h++
      }
      if (h>=p && h<p+height-1) {
        str.append(c)
      }
    })
    str.appendStr('\n')
    return str;
  }
  printToScreen = _.debounce(printToScreen, 16, true)

  var printed = false
  var i = 0
  var totalHeight = 0
  var shortContent;
  return through2.obj(function(chunk, enc, callback){
    var that = this;
    var w = 0
    chunk.forEach(function(c){
      w+= c.str.length;
      if (c.str.match(/\n/)) {
        w = 0
        totalHeight++
      }
      if (w>width) {
        w = 0
        totalHeight++
      }
    })
    wholeBuf.concat(chunk);
    var h = chunk.match(/\n/g);
    i += h && h.length || 0;
    if(!printed && i>=height) {
      printed = true
      pumpable.pause()
      that.push(printToScreen(curPosition))

      var moveUp = _.throttle(function(){
        if (curPosition>0) {
          curPosition--
          require('readline').cursorTo(process.stdout, 0, 0)
          require('readline').clearScreenDown(process.stdout)
          require('readline').cursorTo(process.stdout, 0, 0)
          that.push(printToScreen(curPosition))
        }
      }, 16, true)
      var moveDown = _.throttle(function(){
        if (curPosition+height<totalHeight) {
          curPosition++
          require('readline').cursorTo(process.stdout, 0, 0)
          require('readline').clearScreenDown(process.stdout)
          require('readline').cursorTo(process.stdout, 0, 0)
          that.push(printToScreen(curPosition))
        }
        if (curPosition+height<=totalHeight+3) {
          pumpMoreLines(2)
        }
      }, 16, true)

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
    } else if(!printed){
      clearTimeout(shortContent)
      shortContent = setTimeout(function(){
        printed = true
        that.push(printToScreen(curPosition))
      }, 250)
    }
    callback()

  }, function () {/* endless */});
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


module.exports = less
