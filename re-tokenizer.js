#!/usr/bin/env node

var through2 = require("through2")
var fs = require('fs')
var chalk = require('chalk')
var _ = require('underscore')
var mds = require('./index')
RegExp = mds.RegExp

var argv = require('minimist')(process.argv.slice(2));

var TokenString = mds.TokenString
var multilineToStream = mds.utils.multilineToStream

fs.createReadStream('README.md');
fs.createReadStream('test/fixtures/chalk.md');
fs.createReadStream('test/fixtures/changelog-maker.md');
fs.createReadStream('test/fixtures/resumer.md');

var pumpable = new PausableStream()

fs.createReadStream('README.md')
  .pipe(mds.toTokenString())

  .pipe(pumpable.stream)

  .pipe(mds.markPossibleTokens(['-','_','*','#','~','`']))
  .pipe(mds.byLine())
  .pipe(mds.applyLineBlock('heading', /^\s*(#{1,6})/i))
  .pipe(mds.applyLineBlock('listitem', /^\s*([\-+*]\s)/i))
  .pipe(mds.applyLineBlock('listitem', /^\s*([0-9]+\.\s)/i))
  .pipe(mds.regroupListItemsLines())
  .pipe(mds.applyLineBlock('linecodeblock', /^([ ]{4})/i))
  .pipe(mds.applyTagBlock('codeblock', /[`]{3}/, true))
  .pipe(mds.applyTagBlock('inlinecode', /[`]{1}/))
  .pipe(mds.applyTagBlock('emphasis', /[~]{2}/))
  .pipe(mds.applyTagBlock('emphasis', /[~]{1}/))
  .pipe(mds.applyTagBlock('emphasis', /[~]{2}/))
  .pipe(mds.applyTagBlock('emphasis', /[*]{2}/))
  .pipe(mds.applyTagBlock('emphasis', /[*]{1}/))
  .pipe(mds.applyTagBlock('emphasis', /[_]{2}/))
  .pipe(mds.applyTagBlock('emphasis', /[_]{1}/))

  .pipe(mds.extractBlock('codeblock', mds.cleanBlock()))
  .pipe(mds.extractBlock('inlinecode', mds.cleanBlock()))
  .pipe(mds.extractBlock('linecodeblock', mds.cleanBlock('')))

  .pipe(mds.extractBlock('heading', mds.getBlockContent(mds.removeFrontspace())))
  .pipe(mds.extractBlock(/listitem/, mds.getBlockContent(mds.removeFrontspace())))

  .pipe(mds.extractBlock('codeblock', mds.normalizeFrontspace()))


  .pipe(mds.extractBlock('codeblock', mds.getBlockContent(mds.fence(function () {return [4,0]}))))

  .pipe(mds.extractBlock(/listitem/, function(buf) {
      var t = buf.first().tokenStr.length;
      buf.prependStr(' ')
      mds.getBlockContent(mds.fence(function () {return [t+1, 0]}))(buf)
    }
  ))

  .pipe(mds.removeToken('heading', /.+/))
  .pipe(mds.removeToken('codeblock', /.+/))
  .pipe(mds.removeToken('inlinecode', /.+/))
  .pipe(mds.removeToken('emphasis', /.+/))


  .pipe(mds.extractBlock('linecodeblock', mds.colorizeContent(chalk.white.italic)))
  .pipe(mds.extractBlock('inlinecode', mds.colorizeContent(chalk.white.italic)))
  .pipe(mds.extractBlock('codeblock', mds.colorizeContent(chalk.white.italic)))
  .pipe(mds.extractBlock('emphasis', /_/, mds.colorizeContent(chalk.bold)))
  .pipe(mds.extractBlock('emphasis', /\*/, mds.colorizeContent(chalk.bold)))
  .pipe(mds.extractBlock('emphasis', /~/, mds.colorizeContent(chalk.strikethrough)))
  .pipe(mds.extractBlock('listitem', mds.colorizeToken(chalk.magenta.bold)))
  .pipe(mds.extractBlock('heading', mds.colorizeContent(chalk.bold.underline.cyan)))

  .pipe(less(pumpable))

  .pipe(mds.flattenToString(mds.resolveColors.transform))
  .pipe(process.stdout)
  .on('end', function(){})

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

  var wholeBuf = new mds.TokenString()
  var curPosition = 0
  var printToScreen = function(p){
    var h = 0
    var w = 0
    var str = new mds.TokenString()
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
      if (h>=p && h<p+height) {
        str.append(c)
      }
    })
    return str;
  }

  var printed = false
  var i = 0
  var totalHeight = 0
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
      }, 30, true)
      var moveDown = _.throttle(function(){
        if (curPosition+height<totalHeight) {
          curPosition++
          require('readline').cursorTo(process.stdout, 0, 0)
          require('readline').clearScreenDown(process.stdout)
          require('readline').cursorTo(process.stdout, 0, 0)
          that.push(printToScreen(curPosition))
        }
        if (curPosition+height-totalHeight<10) {
          pumpMoreLines(4)
        }
      }, 30, true)

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


function PausableStream(){
  var that = this
  that.resumer = null;
  that.isPaused = false;
  that.keepPump = null;
  that.stream = through2.obj(function(chunk, enc, callback){

    var pause = that.isPaused
    if (!pause && that.keepPump) {
      pause = that.keepPump(chunk)
    }

    if (pause) {
      that.resumer = function(pushOnly){
        that.stream.push(chunk, enc)
        if (!pushOnly) callback()
      }
      that.keepPump = null
    } else {
      that.stream.push(chunk, enc)
      callback()
    }
  }, function(callback){
    if (that.resumer) {
      that.resumer(true)
    }
    that.resumer = null
    callback()
  })

  that.pause = function(){
    that.isPaused = true
  }
  that.resume = function(){
    that.isPaused = false
    if (that.resumer) {
      that.resumer()
    }
  }
  that.pumpUntil = function(fn){
    that.keepPump = fn
    return that
  }
}

function onlyFirstBlock(cb) {
  var i = 0
  return function(buf){
    if (i<1) cb(buf)
    i++
  }
}
function skipFirstBlock(cb) {
  var i = 0
  return function(buf){
    if (i>0) cb(buf)
    i++
  }
}

function afterBlock(type, required, trim) {
  var buf = new TokenStringBuffer()
  var isInBlock = false
  buf.any(function (chunk) {
    if (chunk.type.match(/^end:/)
      && chunk.type.match(type)) {
      buf.startBuffer()
      isInBlock = true
    }

    if (!isInBlock) {
      buf.flush()
    }

    if (isInBlock) {
      var text = buf.filterType(/text/)
      if (text.length()>required.length) {
        if (text.toString()!==required) {
          var anchor = buf.shift()
          if (trim) {
            var toDelete = []
            var enough = false
            buf.forEach(function(c, i){
              if (c.type.match(/text/)) {
                if (!enough ) {
                  if (trim && c.str.match(trim)) {
                    toDelete.push(i)
                  } else {
                    enough = true
                  }
                }
              }
            })
            toDelete.reverse().forEach(function(index){
              buf.splice(index, 1)
            })
          }
          required.split('').forEach(function(c){
            buf.prepend({type:'text', str: c})
          })
          buf.prepend(anchor)
        }
        isInBlock = false
        buf.stopBuffer()
        buf.flush()
      }
    }
  })
  return buf.stream
}

