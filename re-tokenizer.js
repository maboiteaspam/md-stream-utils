#!/usr/bin/env node

var through2 = require("through2")
var fs = require('fs')
var chalk = require('chalk')
var _ = require('underscore')

RegExp = require('./lib/regexp-quote.js')

var argv = require('minimist')(process.argv.slice(2));


var TokenString = require('./lib/token-string.js')
var thisUtils = require('./lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var getCallerLocation = thisUtils.getCallerLocation

var applyTagBlock = require('./lib/apply-tag-block.js')
var applyLineBlock = require('./lib/apply-line-block.js')
var byLine = require('./lib/by-line.js')
var byWord = require('./lib/by-word.js')
var controlLength = require('./lib/control-length.js')
var colorizeToken = require('./lib/colorize-token.js')
var colorizeContent = require('./lib/colorize-content.js')
var cleanBlock = require('./lib/clean-block.js')
var extractBlockWithWhitespace = require('./lib/extract-block-with-whitespace.js')
var extractBlock = require('./lib/extract-block.js')
var fence = require('./lib/fence.js')
var flattenToString = require('./lib/flatten-to-string.js')
var flattenToJson = require('./lib/flatten-to-json.js')
var getBlockContent = require('./lib/get-block-content.js')
var hideToken = require('./lib/hide-token.js')
var markPossibleTokens = require('./lib/mark-possible-tokens.js')
var normalizeFrontSpace = require('./lib/normalize-frontspace.js')
var revealMarkup = require('./lib/reveal-markup.js')
var removeToken = require('./lib/remove-token.js')
var removeFrontSpace = require('./lib/remove-frontspace.js')
var resolveColors = require('./lib/resolve-colors.js')
var regroupListItemsLines = require('./lib/regroup-list-items-lines.js')
var stringToStruct = require('./lib/to-token-string.js')
var surroundBlock = require('./lib/surround-block.js')
var surroundBlockContent = require('./lib/surround-block-content.js')
var trimBlock = require('./lib/trim-block.js')
var whenBlock = require('./lib/when-block.js')


fs.createReadStream('README.md');
fs.createReadStream('test/fixtures/chalk.md');
fs.createReadStream('test/fixtures/changelog-maker.md');
fs.createReadStream('test/fixtures/resumer.md');

fs.createReadStream('README.md')
  .pipe(stringToStruct())

  //.pipe(pumpable.stream)

  .pipe(markPossibleTokens(['-','_','*','#','~','`']))
  //
  .pipe(byLine())
  .pipe(applyLineBlock('heading', /^\s*(#{1,6})/i))
  .pipe(applyLineBlock('listitem', /^\s*([\-+*]\s)/i))
  .pipe(applyLineBlock('listitem', /^\s*([0-9]+\.\s)/i))
  .pipe(regroupListItemsLines())
  .pipe(applyLineBlock('linecodeblock', /^([ ]{4})/i))

  .pipe(applyTagBlock('codeblock', /[`]{3}/, true))
  .pipe(controlLength(400, '```'))
  .pipe(applyTagBlock('inlinecode', /[`]{1}/))
  .pipe(controlLength(150, '`'))
  .pipe(applyTagBlock('emphasis', /[~]{2}/))
  .pipe(controlLength(50, '~~'))
  .pipe(applyTagBlock('emphasis', /[~]{1}/))
  .pipe(controlLength(50, '~'))
  .pipe(applyTagBlock('emphasis', /[~]{2}/))
  .pipe(controlLength(100, '--'))
  //.pipe(applyTagBlock('emphasis', '-'))
  //.pipe(controlLength(100, '-'))
  //.pipe(byWord('pre'))
  .pipe(applyTagBlock('emphasis', /[*]{2}/))
  .pipe(controlLength(50, '**'))
  .pipe(applyTagBlock('emphasis', /[*]{1}/))
  .pipe(controlLength(50, '*'))
  .pipe(applyTagBlock('emphasis', /[_]{2}/))
  .pipe(controlLength(50, '__'))
  .pipe(applyTagBlock('emphasis', /[_]{1}/))
  .pipe(controlLength(50, '_'))
  //
  .pipe(extractBlock('codeblock', cleanBlock()))
  .pipe(extractBlock('inlinecode', cleanBlock()))
  .pipe(extractBlock('linecodeblock', cleanBlock('')))
  //
  .pipe(extractBlock('heading', removeFrontSpace()))

  //.pipe(extractBlockWithWhitespace('codeblock', function(buf){
  //  trimBlock('\n')(buf)
  //  getBlockContent(trimBlock(/\s+/, 'both'))(buf)
  //  getBlockContent(function(b){
  //    if (!b.split('\n')[0].match(/[a-z]{2,4}\n$/)) {
  //      b.prependStr('\n')
  //    }
  //  })(buf)
  //  buf.prependStr('\n')
  //  buf.appendStr('\n')
  //}))
  ////
  .pipe(extractBlock('codeblock', normalizeFrontSpace()))
  .pipe(extractBlock('codeblock', getBlockContent(fence(4, 0))))
  //////
  //.pipe(byWord('both'))
  //.pipe(extractBlockWithWhitespace('heading', trimBlock('\n')))
  //.pipe(whenBlock('heading', surroundBlock('\n\n\n', '\n\n')))
  //.pipe(whenBlock('heading', onlyFirstBlock(trimBlock('\n', 'left'))))
  //.pipe(whenBlock('heading', onlyFirstBlock(surroundBlock('\n', ''))))
  //.pipe(through2.obj(function(chunk,_,cb){
  //  this.push(chunk)
  //  cb()
  //}))
  //.pipe(extractBlockWithWhitespace('linecodeblock', function(chunk){
  //  console.log(chunk.tokens)
  //  console.log('--------------')
  //}))

  //
  //
  //.pipe(removeToken('emphasis', /.+/))
  .pipe(removeToken('heading', /.+/))
  .pipe(removeToken('codeblock', /.+/))
  .pipe(removeToken('inlinecode', /.+/))
  .pipe(removeToken('emphasis', /.+/))

  //
  .pipe(extractBlock('linecodeblock', colorizeContent(chalk.white.italic)))
  .pipe(extractBlock('inlinecode', colorizeContent(chalk.white.italic)))
  .pipe(extractBlock('codeblock', colorizeContent(chalk.white.italic)))
  //
  .pipe(extractBlock('emphasis', /_/, colorizeContent(chalk.bold)))
  //.pipe(extractBlock('emphasis', /-/, colorizeContent(chalk.blue)))
  .pipe(extractBlock('emphasis', /\*/, colorizeContent(chalk.bold)))
  .pipe(extractBlock('emphasis', /~/, colorizeContent(chalk.strikethrough)))

  .pipe(extractBlock('listitem', colorizeToken(chalk.magenta.bold)))
  .pipe(extractBlock('heading', colorizeContent(chalk.bold.underline.cyan)))
  .pipe(resolveColors())

  //.pipe(afterBlock('heading','\n\n','\n'))

  //.pipe(surroundBlock('==','==', 'emphasis'))
  //.pipe(surroundBlock('==','', 'heading'))
  //.pipe(surroundBlock('>>>','<<<', null, 'heading'))

  //.pipe(revealMarkup('linecodeblock'))
  //.pipe(revealMarkup('listitem'))
  //.pipe(revealMarkup('heading'))
  //.pipe(revealMarkup('codeblock'))
  //.pipe(revealMarkup('emphasis'))
  //.pipe(revealToken('emphasis'))
  //.pipe(revealToken('codeblock'))
  //.pipe(revealToken('inlinecode'))
  //.pipe(revealToken('heading'))
  //.pipe(revealToken('listitem'))
  //.pipe(revealToken('linecodeblock'))

  //.pipe(byLine())
  //.pipe(less(pumpable))
  //
  //.pipe(arrayToStruct())
  //.pipe(flattenToJson())
  .pipe(flattenToString())

  .pipe(process.stdout)
  .on('end', function(){})
multilineToStream(function () {/*
 # md-stream-utils

 Set of utilities to work with Markdown.

 ## sub section

 The **basis** of __this__ work come ~from~ https://github.com/alanshaw/md-tokenizer

 __An alternative to https://github.com/chjj/marked__

 ## Installation
 Run the following commands to download and install the application:

 *Binary install*
 ```sh   npm i md-stream-utils -g ```

 *API install*
 ```sh   npm i md-stream-utils --save ```

 ## Usage

 __md-block:__ A binary tool to parse Markdown content by block.
 + Display 'Usage' section from a `file` with color:

 `md-paragraph -c 'Usage' README.md | md-colorize`


 ## API

 `md-stream-utils` comes with several stream transform modules.

     some code with indent `block`


 ## Ordered list

 1. Some content
 2. Which can be
 multiline
 3. We ll make sure it gets fenced


 */})
  ;

  //fs.createReadStream('README2.md')
//var pumpable = new PausableStream()
//pumpable.pause()


function less(pumpable) {

  var stdin = process.stdin;
  stdin.setRawMode( true );
  stdin.pause();
  stdin.setEncoding( 'utf8' );
  var size = process.stdout.getWindowSize()
  var height = size[1]
  var width = size[0]
  height--

  var pumpMoreLines = function(lines){
    var f = 1
    if (!pumpable.keepPump) {
      pumpable.pumpUntil(function(c){
        if (c.match(/\n/)) {
          f++
        }
        return f>lines
      })
      pumpable.resume()
    }
  }

  var printToScreen = function(sub){
    require('readline').cursorTo(process.stdout, 0, 0)
    require('readline').clearLine(process.stdout, 1)
    var printedHeight = 0
    var linelen = 0
    sub.forEach(function (c) {
      if (c.str.match(/\n/)) {
        linelen = 0
        require('readline').cursorTo(process.stdout, 0, printedHeight)
        require('readline').clearLine(process.stdout, 1)
        printedHeight++
      } else if (printedHeight<=height) {
        if (linelen+c.str.length>=width) {
          require('readline').cursorTo(process.stdout, 0, printedHeight)
          require('readline').clearLine(process.stdout, 1)
          printedHeight++
          linelen =0
        }
        linelen+=c.str.length
      }
    })
    require('readline').cursorTo(process.stdout, 0, height)
    require('readline').clearLine(process.stdout, 1)
  }
  printToScreen = _.throttle(printToScreen, 20, true)


  var wholeBuf = []
  var curPosition = 0

  var moveUp = _.throttle(function(){
    if (curPosition>0) {
      curPosition--
      var sub = wholeBuf.slice(curPosition, curPosition+height)
      printToScreen(sub)
    }
  }, 30, true)
  var moveDown = _.throttle(function(){
    if (curPosition+height<wholeBuf.length) {
      curPosition++
      var sub = wholeBuf.slice(curPosition, curPosition+height)
      printToScreen(sub)
    }
    if (wholeBuf.length-curPosition-height<=10) {
      pumpable.pause()
      pumpMoreLines(4)
    }
  }, 30, true)
  stdin.resume()
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
  pumpMoreLines(height+5)

  var i = 0
  return through2.obj(function(chunk, enc, callback){

    wholeBuf.concat(chunk)
    i++
    if(i===height) {
      printToScreen(wholeBuf.slice(curPosition, curPosition+height))
      pumpable.pause()
      pumpMoreLines(10)
    }
    callback()

  }, function () {/* endless */})
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

