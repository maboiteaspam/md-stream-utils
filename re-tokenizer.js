#!/usr/bin/env node

var through2 = require("through2")
var fs = require('fs')
var chalk = require('chalk')
var _ = require('underscore')
var resumer = require('resumer')
var multiline = require("multiline")
var argv = require('minimist')(process.argv.slice(2));


multilineToStream(function () {/*
 # md-stream-utils

 Set of utilities to work with Markdown.

 The basis of this work come from https://github.com/alanshaw/md-tokenizer

 An alternative to https://github.com/chjj/marked

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


 */})
;
//fs.createReadStream('bench.md')

  //;
  //fs.createReadStream('README2.md')
var pumpable = new PausableStream()
pumpable.pause()

fs.createReadStream('README.md')

  .pipe(stringToStruct())

  .pipe(pumpable.stream)

  .pipe(markPossibleTokens(['-','_','*','#','~','`']))

  .pipe(applyLineBlock('heading', '######'))
  .pipe(applyLineBlock('heading', '#####'))
  .pipe(applyLineBlock('heading', '####'))
  .pipe(applyLineBlock('heading', '###'))
  .pipe(applyLineBlock('heading', '##'))
  .pipe(applyLineBlock('heading', '#'))

  .pipe(applyLineBlock('listitem', '- ', true))
  .pipe(applyLineBlock('listitem', '+ ', true))

  .pipe(applyLineBlock('linecodeblock', '    ', true))

  .pipe(applyTagBlock('codeblock', '```', true))
  .pipe(applyTagBlock('codeblock', '`', false))
  .pipe(applyTagBlock('emphasis', '~~', false))
  .pipe(applyTagBlock('emphasis', '~', false))
  .pipe(applyTagBlock('emphasis', '--', false))
  .pipe(applyTagBlock('emphasis', '-', false))
  .pipe(applyTagBlock('emphasis', '**', false))
  .pipe(applyTagBlock('emphasis', '*', false))
  .pipe(applyTagBlock('emphasis', '__', false))
  .pipe(applyTagBlock('emphasis', '_', false))

  .pipe(extractBlock('codeblock', cleanBlock()))
  .pipe(extractBlock('linecodeblock', cleanBlock('')))

  .pipe(extractBlock('heading', removeFrontSpace()))
  .pipe(extractBlock('codeblock', normalizeFrontSpace()))
  .pipe(extractBlock('codeblock', fence(4, 2)))

  .pipe(extractBlock('heading', colorizeContent(chalk.cyan)))
  .pipe(extractBlock('linecodeblock', colorizeContent(chalk.white.italic)))
  .pipe(extractBlock('codeblock', colorizeContent(chalk.white.italic)))
  .pipe(extractBlock('listitem', colorizeToken(chalk.magenta.bold)))

  .pipe(extractBlock('emphasis', /_/, colorizeContent(chalk.bold.yellow)))
  .pipe(extractBlock('emphasis', /-/, colorizeContent(chalk.blue)))
  .pipe(extractBlock('emphasis', /\*/, colorizeContent(chalk.magenta)))
  .pipe(extractBlock('emphasis', /~/, colorizeContent(chalk.magenta)))


  .pipe(hideToken('emphasis', /.+/))
  .pipe(hideToken('heading', /.+/))
  .pipe(hideToken('codeblock', /.+/))
  .pipe(afterBlock('heading','\n\n','\n'))

  //.pipe(surroundBlock('==','==', 'emphasis'))
  .pipe(surroundBlock('==','', 'heading'))
  //.pipe(surroundBlock('>>>','<<<', null, 'heading'))

  //.pipe(revealMarkup('emphasis'))
  //.pipe(revealMarkup('listitem'))
  //.pipe(revealMarkup('heading'))
  //.pipe(revealMarkup('codeblock'))

  .pipe(byLine())
  .pipe(less(pumpable))

  .pipe(arrayToStruct())
  .pipe(flattenToString())

  .pipe(process.stdout)
  .on('end', function(){})

function byLine() {
  var buf = new StreamBuffer2()
  buf.startBuffer()
  buf.any(function (chunk) {
    if (chunk.str.match(/\n/)) {
      var line = buf.splice(0)
      buf.flush()
      buf.append({
        type: 'array:node',
        str: line.toString(),
        originalToken: line.buffer
      })
      buf.flush()
    }
  })
  return buf.stream
}
function arrayToStruct() {
  var buf = new StreamBuffer2()
  buf.any(function (chunk) {
    if (_.isArray(chunk)) {
      buf.pop()
      chunk.forEach(function (c) {
        buf.append(c)
      })
    } else if (chunk.type.match(/^array/)) {
      buf.pop()
      chunk.originalToken.forEach(function (c) {
        buf.append(c[0])
      })
    }
  })
  return buf.stream
}

function less(pumpable) {

  var stdin = process.stdin;
  stdin.setRawMode( true );
  stdin.pause();
  stdin.setEncoding( 'utf8' );
  var size = process.stdout.getWindowSize()
  var height = size[1]
  var width = size[0]
  height--

  var wholeBuf = new StreamBuffer2()
  wholeBuf.startBuffer()

  var pumpMoreLines = function(lines){
    var f = 1
    if (!pumpable.keepPump) {
      pumpable.pumpUntil(function(c){
        if (c.str.match(/\n/)) {
          f++
        }
        return f>lines
      })
      pumpable.resume()
    }
  }

  var i = 0
  var lessBuf = new StreamBuffer2(through2.obj(function(chunk, enc, callback){
    wholeBuf.through(chunk)
    i++
    if(i+1===height) {
      var sub = wholeBuf.slice(startLinePosition, startLinePosition+height)
      printToScreen(sub)
      pumpMoreLines(10)
      pumpable.pause()
    }
    callback()
  }, function (callback) {
    //lessBuf.flush ()
    //callback() // it is un-finish-able stream
  }))

  var startLinePosition = 0

  var printToScreen = function(sub){
    require('readline').cursorTo(process.stdout, 0, 0)
    require('readline').clearLine(process.stdout, 1)
    lessBuf.skip()
    var printedHeight = 0
    sub.forEach(function (line) {
      var linelen = 0
      line.originalToken.forEach(function (c) {
        c = c[0]
        if (c.str.match(/\n/)) {
          linelen = 0
          require('readline').cursorTo(process.stdout, 0, printedHeight)
          require('readline').clearLine(process.stdout, 1)
          printedHeight++
          lessBuf.flush()
        } else if (printedHeight<=height) {
          if (linelen+c.str.length>=width) {
            require('readline').cursorTo(process.stdout, 0, printedHeight)
            require('readline').clearLine(process.stdout, 1)
            printedHeight++
            lessBuf.flush()
            linelen =0
          }
          linelen+=c.str.length
          lessBuf.append(c)
        }
      })
    })
    require('readline').cursorTo(process.stdout, 0, height)
    require('readline').clearLine(process.stdout, 1)
  }
  printToScreen = _.throttle(printToScreen, 20, true)
  var moveUp = _.throttle(function(){
    if (startLinePosition>0) {
      startLinePosition--
      var sub = wholeBuf.slice(startLinePosition, startLinePosition+height)
      printToScreen(sub)
    }
  }, 30, true)
  var moveDown = _.throttle(function(){
    if (startLinePosition+height<wholeBuf.buffer.length) {
      startLinePosition++
      var sub = wholeBuf.slice(startLinePosition, startLinePosition+height)
      printToScreen(sub)
    }
    if (wholeBuf.buffer.length-startLinePosition-height<=10) {
      pumpMoreLines(1)
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
  pumpMoreLines(height)

  return lessBuf.stream
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


function markPossibleTokens(tokens) {
  return through2.obj(function(chunk, enc, callback){
    if (tokens.indexOf(chunk.str)>-1) {
      chunk.type = 'maybe:token'
    }
    this.push(chunk, enc)
    callback()
  })
}
function applyLineBlock(tag, token, loosy) {
  var buf = new StreamBuffer2()
  var isInBlock = true
  buf.startBuffer()
  buf.onceStr('\n', function () {
    if (!isInBlock) {
      buf.flush().startBuffer()
    } else if(isInBlock && buf.strLength()>=token.length) {
      var startTokens = buf.slice(0, token.length+10)
        .filterNotType('token:');
      if ( !loosy && startTokens.filterStr(token[0]).length()===token.length
        || loosy && startTokens.substr(0, token.length)===token) {
        var preNl = null
        var postNl = null
        if (buf.first().str.match(/\n/)) {
          preNl = buf.shift()
        }
        if (buf.last().str.match(/\n/)) {
          postNl = buf.pop()
        }
        var e = 0
        buf.splice(0).forEach(function(c, i){
          if (!c.type.match(/token:/) && c.str===token[e] && i<token.length) {
            c.type = 'token:'+tag
            e++
          }
        }).prepend({type:'start:'+tag, power: token.length, tokenStr: token})
          .append({type:'end:'+tag, power: token.length, tokenStr: token})
          .forEach(function(c){
            buf.append(c)
          }).skip()
        if (preNl) buf.prepend(preNl)
        if (postNl) buf.append(postNl)
      }
      buf.flush()
      isInBlock = false
    }
  })
  buf.not('\n', function () {
    if (buf.strLength()>=token.length+2) {
      var startTokens = buf.slice(0, token.length+1)
        .filterNotType('token:')
      var endTokens = buf.slice(-token.length-1)
        .filterNotType('token:')
      if (!isInBlock && startTokens.substr(0, token.length)===token) {
        isInBlock = true
      } else if (!isInBlock && endTokens.substr(-token.length)===token) {
        isInBlock = true
        buf.tail(token.length+1)
      //} else if (isInBlock) {
      //  buf.flush()
      //  isInBlock = false
      //} else if (!isInBlock) {
      //  isInBlock = true
      }
    }
  })
  return buf.stream
}

function revealMarkup(tag) {
  var buf = new StreamBuffer2()
  buf.any(function (chunk) {
    if (chunk.type
      && chunk.type.match(/^(start|end)/)
      && chunk.type.match(tag)) {
      var str = '' + chunk.type
      if (chunk.type.match(/^(start)/)){
        str+='['+chunk.power+']'+':'
        buf.prepend({type:'text', str:str})
      } else {
        buf.append({type:'text', str:':'+str})
      }
    }
  })
  return buf.stream
}


function applyTagBlock(tag, str, allowNewLines) {
  var buf = new StreamBuffer2()

  buf.startBuffer()
  var isInBlock = false
  buf.onceStr(str, function (chunk) {
    if (chunk.type=='maybe:token') {
      if (!isInBlock) {
        var pre = buf.slice(buf.length()-(str.length+1), buf.length()-str.length)
        if (!pre.length() || pre.first().str.match(/\s/)) {
          buf.tail(str.length).startBuffer()
          isInBlock = true
        }
      } else {

        if (buf.strLength()<=str.length*2) {
          buf.flush()
          isInBlock = false

        } else {
          var startTokens = buf.splice(0, str.length)
            .forEach(function(c){
              c.type = 'token:'+tag
            }).prepend({type:'start:'+tag, power: str.length, tokenStr: str})

          var endTokens = buf.splice(-str.length)
            .forEach(function(c){
              c.type = 'token:'+tag
            }).append({type:'end:'+tag, power: str.length, tokenStr: str})

          startTokens.flush()
          buf.flush()
          endTokens.flush()

          isInBlock = false
        }

      }
    }
  })
  buf.onceStr('\n', function (chunk) {
    if (isInBlock && !allowNewLines) {
      buf.flush()
      isInBlock = false
    }else if (!isInBlock) {
      buf.flush()
    }
  })
  buf.any(function (chunk) {
    if (!isInBlock && buf.strLength() > str.length*2) {
      buf.tail(str.length*2)
      isInBlock = false
    }
  })

  return buf.stream
}
function cleanBlock(tokenEnd) {
  return function (buf) {
    var token = buf.first().tokenStr
    if (tokenEnd==null) {
      tokenEnd = token
    }
    buf.less(token.length+1)
    buf.splice(0, buf.length()-(tokenEnd.length+1))
      .reverse()
      .forEach(function(c){
        if (!c.type.match(/text/)) {
          if (c.type.match(/token/)) {
            c.type = 'text'
            buf.prepend(c)
          }
        } else {
          buf.prepend(c)
        }
      })
  }
}
function normalizeFrontSpace() {
  return function (buf) {
    var len = 0
    var lines = buf.filterType('text').split('\n')
    var m = lines[0].match(/^(\s+)/)
    if (!m && lines.length>1) {
      m = lines[1].match(/^(\s+)/)
    }
    if (m) {
      len = m[1].length
    }

    var index = 0
    buf.split('\n').forEach(function(line){
      var e = 0
      line.forEach(function (c, i) {
        if (c.str.match(/[ ]/)) {
          if (e<len ) {
            var t = buf.splice(index, 1)
            index--
          }
          e++
        }
        index++
      })
    })

  }
}
function removeFrontSpace() {
  return function (buf) {
    var index = 0
    buf.split('\n').forEach(function(line){
      var keepRemove = true
      line.forEach(function (c, i) {
        if (c.type==='text') {
          if (keepRemove && c.str.match(/[ ]/)) {
            var g = buf.splice(index, 1)
            index--
          } else if(keepRemove && c.str.length) {
            keepRemove = false
          }
        }
        index++
      })
    })

  }
}
function fence(regularSpaceCnt, firstLineSpaceCnt) {
  if (firstLineSpaceCnt===null) {
    firstLineSpaceCnt = spaceCnt
  }
  return function (buf) {
    var index = 0
    var lines = buf.split('\n')
    if (lines.length>1) {
      lines.forEach(function(line, lineIndex){
        var start = null
        line.forEach(function (c, i) {
          if (start===null && c.type==='text') {
            start = i
          }
        })
        var spaceCnt;
        if (lineIndex===0) {
          spaceCnt = firstLineSpaceCnt
        } else {
          spaceCnt = regularSpaceCnt
        }
        for (var i=0;i<spaceCnt;i++) {
          buf.splice(index+start, 0, [{type: 'text', str: ' '}])
        }
        index+=line.length()+spaceCnt
      })
    }
  }
}


function extractBlock(tag, token, then) {
  if (!then) {
    then = token
    token = null
  }
  var buf = new StreamBuffer2()
  var isInBlock = false
  buf.any(function (chunk) {
    if (chunk.type==='start:'+tag && (!token || chunk.tokenStr.match(token))) {
      buf.tail(1).startBuffer()
      isInBlock = true
    } else if (isInBlock && chunk.type==='end:'+tag && (!token || chunk.tokenStr.match(token))) {
      then(buf)
      buf.flush().stopBuffer()
      isInBlock = false
    }
  })
  return buf.stream
}



function colorizeContent(colorizer) {
  var open = '';
  var close = '';
  colorizer._styles.forEach(function(style){
    open += chalk.styles[style].open
    close = chalk.styles[style].close + close
  })
  return function(buf) {
    var text = buf.filterType('text');
    var tag = buf.first().type.split(':')[1]
    text.first().prepend = (text.first().prepend||'') + open
    text.last().append = close + (text.last().append||'')
    buf.filterType(/^end:/).filterNotType('end:'+tag).forEach(function(c, i){
      c.prepend = (c.prepend||'') + open
    })
    buf.filterStr(/\n/).forEach(function(c, i){
      c.prepend = (c.prepend||'') + open
    })
    buf.last().prepend = close + (buf.last().prepend||'')
  }
}
function colorizeToken(colorizer) {
  var open = '';
  var close = '';
  colorizer._styles.forEach(function(style){
    open += chalk.styles[style].open
    close = chalk.styles[style].close + close
  })
  return function(buf) {
    var tag = buf.first().type.split(':')[1]
    buf.filterType('token:'+tag).forEach(function(c){
      c.prepend = open
      c.append = close
    })
  }
}

function hideToken(tag, token) {
  var buf = new StreamBuffer2()
  buf.startBuffer()
  buf.any(function (chunk) {
    if (chunk.type==='token:'+tag && chunk.str.match(token)) {
      buf.pop()
    }
    buf.flush()
  })
  return buf.stream
}
function surroundBlock(open, close, type, notType) {
  var buf = new StreamBuffer2()
  buf.startBuffer()
  buf.any(function (chunk) {
    if (chunk.type.match(/^start:/)) {
      if (!type || chunk.type.match(type)) {
        if (!notType || !chunk.type.match(notType)) {
          buf.pop()
          buf.append({type: 'text', str: open})
          buf.append(chunk)
        }
      }
    }
    if (chunk.type.match(/^end:/)) {
      if (!type || chunk.type.match(type)) {
        if (!notType || !chunk.type.match(notType)) {
          buf.append({type: 'text', str: close})
        }
      }
    }
    buf.flush()
  })
  return buf.stream
}
function afterBlock(type, required, trim) {
  var buf = new StreamBuffer2()
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

function StreamBuffer2(stream){

  this.buffer = []
  this.strBuffer = ''
  this.isBuffering = false


  this.onceBlock = []
  this.onChunk = []

  var that = this
  this.stream = stream || through2.obj(function(chunk, enc, callback){
    that.through(chunk)
    callback()
  }, function (callback) {
    that.flush ()
    callback()
  });

  this.through = function (chunk){

    !('str' in chunk) && (chunk.str = '')
    var args = [].slice.call(arguments);

    this.buffer.push(args)
    this.strBuffer += chunk.str

    this.onChunk.forEach(function (fn) {
      fn(chunk)
    })

    if (!this.isBuffering && !this.isPaused) {
      this.flush()
    }
  }

  this.toString = function (){
    return this.strBuffer
  }
  this.startBuffer = function (){
    this.isBuffering = true
    return this
  }
  this.pipe = function (stream){
    return this.stream.pipe(stream)
  }
  this.stopBuffer = function (){
    this.isBuffering = false
    return this
  }

  this.onceBlock = function (block, cb){
    this.onceBlock.push({
      block: block,
      cb: cb
    })
    return this
  }

  this.any = function (cb){
    this.onChunk.push(cb)
    return this
  }
  this.not = function (str, cb){
    this.onChunk.push(function (chunk) {
      if (chunk.str!==str) {
        cb(chunk)
      }
    })
    return this
  }
  this.notMatch = function (str, cb){
    this.onChunk.push(function (chunk) {
      if (chunk.str && !chunk.str.match(str)) {
        cb(chunk)
      }
    })
    return this
  }
  this.onceStr = function (str, cb){
    this.onChunk.push(function (chunk) {
      var strBuffer = that.strBuffer
      if (strBuffer.substr(strBuffer.length-str.length, str.length)===str) {
        cb(chunk)
      }
    })
    return this
  }
  this.onceMatch = function (str, cb){
    this.onChunk.push(function (chunk) {
      if (chunk.str && chunk.str.match(str)) {
        cb(chunk)
      }
    })
    return this
  }


  this.append = function (chunk){
    !('str' in chunk) && (chunk.str = '')
    this.strBuffer += chunk.str
    this.buffer.push([chunk])
    return this
  }
  this.appendStr = function (strChunk, type){
    var that = this
    that.append({type: type || 'text', str: strChunk})
    return this
  }
  this.prepend = function (chunk){
    !('str' in chunk) && (chunk.str = '')
    this.strBuffer = chunk.str + this.strBuffer
    this.buffer.unshift([chunk])
    return this
  }
  this.prependStr = function (strChunk, type){
    var that = this
    that.prepend({type: type || 'text', str: strChunk})
    return this
  }

  this.match = function (content){
    return this.strBuffer.match(content)
  }
  this.strLength = function (){
    return this.strBuffer.length
  }
  this.substr = function (){
    return this.strBuffer.substr.apply(this.strBuffer, arguments)
  }

  this.shift = function (){
    var chunk = this.buffer.shift()
    if (chunk) {
      chunk = chunk[0]
      this.strBuffer = this.strBuffer.substr(chunk.str.length)
    }
    return chunk
  }
  this.pop = function (){
    var chunk = this.buffer.pop()
    if (chunk) {
      this.strBuffer = this.strBuffer.substr(0, this.strBuffer.length-chunk[0].str.length)
    }
    return chunk[0]
  }

  this.slice = function (){
    var args = [].slice.call(arguments);
    var sub = new StreamBuffer2(that.stream)
    sub.buffer = this.buffer.slice.apply(this.buffer, args)
    // this won t detect white nodes
    // can read count of white nodes in `sub`
    // to re splice again of that amount of nodes.

    sub.updateChanges__()

    return sub
  }
  this.splice = function (){
    var args = [].slice.call(arguments);
    var sub = new StreamBuffer2(that.stream)
    sub.buffer = [].splice.apply(this.buffer, args)
    // this won t detect white nodes
    // can read count of white nodes in `sub`
    // to re splice again of that amount of nodes.


    sub.updateChanges__()
    this.updateChanges__()

    return sub
  }
  this.split = function (by){
    var buffers = []
    var e = 0
    this.forEach(function(c, i){
      if (c.str.match(by)) {
        buffers.push(
          that.slice(e, i+1)
        )
        e = i+1
      }
    })
    if (e===0) {
      buffers.push(
        that.slice(e, that.length())
      )
    }
    return buffers
  }
  this.concat = function (buf){
    var that = this
    buf.forEach(function (chunk) {
      that.append(chunk)
    })
    return this
  }

  this.reverse = function (){
    this.buffer.reverse()
    this.updateChanges__()
    return this
  }
  this.filterType = function (t){
    var sub = new StreamBuffer2(that.stream)
    this.forEach(function(c, i){
      if (c.type && c.type.match(t)) {
        sub.buffer.push(that.buffer[i])
      }
    })
    sub.updateChanges__()
    return sub
  }
  this.filterNotType = function (t){
    var sub = new StreamBuffer2(that.stream)
    this.forEach(function(c, i){
      if (c.type && !c.type.match(t)) {
        sub.buffer.push(that.buffer[i])
      }
    })
    sub.updateChanges__()
    return sub
  }
  this.filterStr = function (t){
    var sub = new StreamBuffer2(that.stream)
    this.forEach(function(c, i){
      if (c.str && c.str.match(t)) {
        sub.buffer.push(that.buffer[i])
      }
    })
    sub.updateChanges__()
    return sub
  }
  this.getLastToken = function (type){
    for( var i=this.buffer.length-1;i>=0;i--) {
      if (this.buffer[i][0].type.match(type)) {
        return this.buffer[i][0]
      }
    }
    return null
  }
  this.first = function (){
    if (this.buffer.length) {
      return this.buffer[0][0]
    }
    return null
  }
  this.last = function (){
    if (this.buffer.length) {
      return this.buffer[this.buffer.length-1][0]
    }
    return null
  }
  this.forEach = function (then){
    this.buffer.forEach(function (chunk, i) {
      if (then)
        then(chunk[0], i)
    })
    return this
  }
  this.length = function (){
    return this.buffer.length
  }


  this.flush = function (){
    var stream = that.stream
    this.buffer.forEach(function(c){
      stream.push.apply(stream, c)
    })
    this.buffer = []
    this.strBuffer = ''
    return this
  }
  this.tail = function (l){
    var tail = this.splice(-l)
    this.flush()
    tail.forEach(function(c){
      that.append(c)
    })
    return this
  }
  this.less = function (l){
    var begin = this.splice(l)
    this.flush()
    begin.forEach(function(c){
      that.append(c)
    })
    return this
  }

  this.skip = function (){
    this.buffer = []
    this.strBuffer = ''
    return this
  }

  this.updateChanges__ = function (){
    var s = ''
    this.buffer.forEach(function(c){
      s += c.length ? c[0].str : c.str
    })
    this.strBuffer = s
  }
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




/**
 * Helper to produce test and samples
 * @param fn
 * @param append
 * @returns {*|number}
 */
function multilineToStream(fn, append){
  var str = multiline.stripIndent(fn) + (append||'')
  return resumer().queue(str).end()
}


/**
 * Build struct of a string for markup parsing
 *
 * @returns {*}
 */
function stringToStruct(){
  return through2.obj(function (chunk, enc, callback) {
    for (var i = 0; i < chunk.length; i++){
      var str;
      if (_.isString(chunk)) {
        str = chunk[i].toString('utf8');
      } else {
        str = chunk.toString('utf8', i, i+1)
      }
      this.push({type: 'text', str: str})
    }
    callback()
  })
}

/**
 * Flatten structs to string
 * Useful to pipe to stdout or similar
 *
 * @returns {*}
 */
function flattenToString(){
  return through2.obj(function (chunk, enc, callback) {
    this.push((chunk.prepend || '') + chunk.str + (chunk.append || ''))
    callback()
  })
}

/**
 * Flatten structs to string
 * Useful to pipe to stdout or similar
 *
 * @returns {*}
 */
function flattenToJson(){
  return through2.obj(function (chunk, enc, callback) {
    this.push(JSON.stringify(chunk)+'\n')
    callback()
  })
}
