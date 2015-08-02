#!/usr/bin/env node

var through2 = require("through2")
var fs = require('fs')
var chalk = require('chalk')
var _ = require('underscore')
var resumer = require('resumer')
var multiline = require("multiline")
var argv = require('minimist')(process.argv.slice(2));



multilineToStream(function () {/*
 ### ## Heading 1
 Some *italic* and __bold__ in the __title
 **and** also in__ some _text_ -tomate-
 ### ## Heading 2

 #*Usage*

 __README__

 `md-block -c 'Usage' -t 'heading' README.md`

 -c || --dd sdfsd hhhh
 -j || --ff sdfsd iiii

 */})
;
fs.createReadStream('README.md')
  //;
  //fs.createReadStream('README2.md')

  .pipe(stringToStruct())
  .pipe(through2.obj(function(chunk, enc, callback){
    if (chunk.str.match(/[-_\*~#]/)) {
      chunk.type = 'maybe:token'
    }
    this.push(chunk, enc)
    callback()
  }))
  .pipe(lineBlock('heading', '#', 6))
  //.pipe(lineBlock('codeline', ' ', 6))

  .pipe(emphasis('```', true))
  .pipe(emphasis('``', true))


  .pipe(emphasis('`', false))
  .pipe(emphasis('--', false,  '`'))
  .pipe(emphasis('-', false,  '`'))
  .pipe(emphasis('**', false,  '`'))
  .pipe(emphasis('*', false,  '`'))
  .pipe(emphasis('__', false,  '`'))
  .pipe(emphasis('_', false,  '`'))

  .pipe(through2.obj(function(chunk, enc, callback){
    if (chunk.type.match(/maybe:token/)) {
      chunk.str = chalk.red.bold(chunk.str)
    }
    this.push(chunk, enc)
    callback()
  }))

  .pipe(block('heading', chalk.cyan, null, false))
  .pipe(block('emphasis', chalk.white.italic, '`', false))
  .pipe(block('emphasis', chalk.bold, '_', false))
  .pipe(block('emphasis', chalk.blue, '-', false))
  .pipe(block('emphasis', chalk.magenta, '*', false))

  .pipe(through2.obj(function(chunk, enc, callback){
    this.push(chunk, enc)
    callback()
  }))
  .pipe(byLine())
  .pipe(less())
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
        originalToken: line
      })
      buf.flush()
    }
  })
  return buf.stream
}
function arrayToStruct() {
  var buf = new StreamBuffer2()
  buf.any(function (chunk) {
    if (chunk.type.match(/^array/)) {
      buf.pop()
      chunk.originalToken.forEach(function (c) {
        buf.append(c)
      })
    }
  })
  return buf.stream
}
function less() {
  var lessBuf = new StreamBuffer2(through2.obj(function(chunk, enc, callback){
    lessBuf.through(chunk)
    if (lessBuf.isPaused) lessBuf.moveNext = callback
    else callback()
  }, function (callback) {
    //lessBuf.flush ()
    //callback() // it is un-finish-able stream
  }))

  if (process.stdout.isTTY) {

    var stdin = process.stdin;
    stdin.setRawMode( true );
    stdin.pause();
    stdin.setEncoding( 'utf8' );
    var size = process.stdout.getWindowSize()
    var width = size[0]
    var height = size[1]
    var startLinePosition = 0
    var curLinesDisplayed = 0

    height--

    var wholeBuf = new StreamBuffer2()
    wholeBuf.startBuffer()

    var moveUp = function(){
      if (startLinePosition>0) {
        curLinesDisplayed=startLinePosition+height
        startLinePosition--
        lessBuf.skip()
        ////console.log(lessBuf.buffer)
        //var sub = wholeBuf.slice(startLinePosition, startLinePosition+height)
        //sub.forEach(function (line) {
        //  line.originalToken.forEach(function (c) {
        //    lessBuf.append(c)
        //  })
        //})
        //lessBuf.updateChanges__()
        ////console.log('___________ %s', startLinePosition)
        //////console.log(wholeBuf.buffer.length, sub.buffer.length, startLinePosition, height)
        ////console.log(lessBuf.strBuffer)
        ////console.log('----------------')
        //lessBuf.flush()
        var sub = wholeBuf.slice(startLinePosition, startLinePosition+height)
        sub.reverse().forEach(function (line, i) {
          require('readline').cursorTo(process.stdout,
            0,
            sub.buffer.length-i-1)
          require('readline').clearLine(process.stdout, 0)
          line.originalToken.forEach(function (c) {
            lessBuf.append(c)
            lessBuf.flush()
          })
        })
        require('readline').cursorTo(process.stdout,
          0,
          sub.buffer.length)
      }
    }
    var moveDown = function(){
      if (startLinePosition+height<wholeBuf.buffer.length) {
        var sub = wholeBuf.slice(startLinePosition+height,
          startLinePosition+height+1)
        startLinePosition++
        lessBuf.skip()
        sub.forEach(function (line) {
          line.originalToken.forEach(function (c) {
            lessBuf.append(c)
          })
        })
        lessBuf.flush()
        lessBuf.resume()
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

    lessBuf.startBuffer()
    lessBuf.any(function (chunk) {
      wholeBuf.through(chunk)
      lessBuf.skip()
      if (curLinesDisplayed >= startLinePosition
        && curLinesDisplayed < startLinePosition+height) {
        var sub = wholeBuf.slice(curLinesDisplayed, curLinesDisplayed+1)
        sub.forEach(function (line) {
          line.originalToken.forEach(function (c) {
            lessBuf.append(c)
          })
        })
        //console.log('ss %s %s %s %s',
        //  curLinesDisplayed, startLinePosition,
        //  sub.buffer.length,
        //  wholeBuf.buffer.length)
        lessBuf.flush()
      }
      if (curLinesDisplayed == startLinePosition+height+1) {
        lessBuf.pause()
      }
      curLinesDisplayed++
    })
  }

  return lessBuf.stream
}

function clearScreen (std){
  std = std || process.stdout
  std.write('\033[2J');
  std.write('\033');
  std.write('\n');
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



function lineBlock(block, str, maxPower) {
  var buf = new StreamBuffer2()
  var okStr = str.match(/[\[\]*]/) ? str.replace(/([\[\]*])/g, '\\$1') : str
  var okNotStr = str.match(/[\[\]*]/) ? str[0].replace(/([\[\]*])/g, '\\$1') : str[0]
  maxPower = maxPower || 1;
  var power;
  var hasFound;
  buf.onceStr(str[0], function () {
    buf.isBuffering = true
  })
  var regexp = '['+okStr+']{1,'+maxPower+'}[^'+okNotStr+']$'
  buf.onceMatch(new RegExp(regexp), function () {
    if (!hasFound) {
      var anchor = buf.pop()
      power = buf.strLength()
      buf.forEach(function(c){
        c.type = 'token:'+block
        c.power = power
      })
      buf.prepend({type: 'start:'+block, power: power})
      buf.append(anchor)
      hasFound = true
    }
  })
  buf.onceMatch(/\n/, function () {
    if (hasFound) {
      var anchor = buf.pop()
      buf.append({type: 'end:'+block, power: power})
      buf.append(anchor)
      buf.isBuffering = false
      hasFound = false
    }
  })
  return buf.stream
}
function emphasis(str, allowNewLines, excludeFromTokens) {
  var buf = new StreamBuffer2()

  buf.isBuffering = true
  var okStr = str.match(/[\[\]*]/) ? str.replace(/([\[\]*])/g, '\\$1') : str
  var okNotStr = str.match(/[\[\]*]/) ? str[0].replace(/([\[\]*])/g, '\\$1') : str[0]

  var skip = false
  if (excludeFromTokens) {
    buf.onceMatch(excludeFromTokens, function (m, chunk) {
      if (!skip && buf.getLastToken(/start:emphasis/)!==false) {
        skip = true
      }else if (skip && chunk.type.match(/end:emphasis/)) {
        skip = false
        buf.forEach(function(c){
          if (c.type.match(/maybe:token/) && c.str===str[0]) {
            c.type = 'text'
          }
        })
        buf.flush()
      }
    })
  }
  buf.onceStr(str, function (chunk) {
    if( chunk.type.match(/^token:/) ) {
      buf.flush()
    }
  })

  var regexp = '('+okStr+'[^'+okNotStr+']+'+okStr+')$'
  if (!allowNewLines) {
    regexp = '('+okStr+'[^'+okNotStr+'\n]+'+okStr+')$'
  }

  buf.onceMatch(new RegExp('\\s' + regexp + '$'), function (matched) {
    if(skip) return
    //console.log(matched)
    // [ '#*Usage*', '*Usage*', index: 0, input: '#*Usage*' ]
    //console.log(buf.buffer)
    /*
     [ [ { type: 'start:heading', power: 1, str: '' } ],
     [ { type: 'token:heading', str: '#', power: 1 } ],
     [ { type: 'maybe:token', str: '*' } ],
     [ { type: 'text', str: 'U' } ],
     [ { type: 'text', str: 's' } ],
     [ { type: 'text', str: 'a' } ],
     [ { type: 'text', str: 'g' } ],
     [ { type: 'text', str: 'e' } ],
     [ { type: 'maybe:token', str: '*' } ] ]
     */
    var text = buf.splice(-matched[1].length)

    var startTokens = text.splice(0, str.length)
      .forEach(function(c){
        c.type = 'token:emphasis'
      }).prepend({type:'start:emphasis', power: str.length})

    var endTokens = text.splice(-str.length)
      .forEach(function(c){
        c.type = 'token:emphasis'
      }).append({type:'end:emphasis', power: str.length})

    buf.flush()
    startTokens.flush()
    text.flush()
    endTokens.flush()
  })
  buf.onceMatch(new RegExp('^' + regexp + '$'), function () {
    if(skip) return
    //console.log(buf.buffer)

    var startTokens = buf.splice(0, str.length)
      .forEach(function(c){
        c.type = 'token:emphasis'
      }).prepend({type:'start:emphasis', power: str.length})

    var endTokens = buf.splice(-str.length)
      .forEach(function(c){
        c.type = 'token:emphasis'
      }).append({type:'end:emphasis', power: str.length})

    startTokens.flush()
    buf.flush()
    endTokens.flush()
    buf.flush()
  })

  return buf.stream
}
function block(bName, colorizer,  token, showTokens) {
  var buf = new StreamBuffer2()
  var okToken = token && token.match(/[\[\]*]/) ? token.replace(/([\[\]*])/g, '\\$1') : token
  buf.any(function (chunk) {
    if (chunk.type.match('start:'+bName)) {
      buf.isBuffering = true
    }else if (chunk.type.match('end:'+bName)) {

      var okBlock = !token
      if (token) {
        var last = buf.getLastToken(/^token:/);
        okBlock = last && last.str.match(okToken);
      }

      if (okBlock) {
        buf.forEach(function (chunk) {
          if (!showTokens && chunk.type.match(/^token:/)) {
            chunk.originalStr = chunk.str;
            chunk.str = '';
          }
          if (chunk.str) {
            chunk.str = colorizer(chunk.str)
          }
          if (!showTokens && chunk.type.match(/^token:/)) {
            chunk.originalStr = chunk.str;
            chunk.str = '';
          }
        })
      }

      buf.isBuffering = false
    }
  })
  return buf.stream
}
function StreamBuffer2(stream){

  this.buffer = []
  this.strBuffer = ''
  this.isBuffering = false
  this.isPaused = false
  this.moveNext = null
  this.onceBlock = []
  this.anyCb = []
  this.onceCb = []
  this.onceStrCb = []

  var that = this
  this.stream = stream || through2.obj(function(chunk, enc, callback){
    that.through(chunk)
    if (that.isPaused) that.moveNext = callback
    else callback()
  }, function (callback) {
    that.flush ()
    callback()
  });

  this.through = function (chunk){
    !('str' in chunk) && (chunk.str = '')
    var args = [].slice.call(arguments);
    this.buffer.push(args)
    this.strBuffer += chunk.str

    var that = this
    this.anyCb.forEach(function(o){
      o.cb(chunk)
    })
    this.onceStrCb.forEach(function(o){
      if (that.strBuffer.substr(that.strBuffer.length-o.str.length)===o.str){
        o.cb(chunk)
      }
    })
    this.onceCb.forEach(function(o){
      var matched = that.strBuffer.match(o.rx)
      if (matched)
        o.cb(matched, chunk)
    })

    if (!this.isBuffering) {
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
    this.isBuffering = true
    return this
  }
  this.pause = function (){
    this.isPaused = true
    return this
  }
  this.resume = function (){
    var callback = this.moveNext
    this.isPaused = false
    this.moveNext = null
    if (callback) callback()
    return this
  }

  this.any = function (cb){
    this.anyCb.push({
      cb: cb
    })
    return this
  }

  this.onceBlock = function (block, cb){
    this.onceBlock.push({
      block: block,
      cb: cb
    })
    return this
  }

  this.onceStr = function (strChunk, cb){
    this.onceStrCb.push({
      str: strChunk,
      cb: cb
    })
    return this
  }

  this.onceMatch = function (strChunk, cb){
    this.onceCb.push({
      rx: strChunk,
      cb: cb
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

  this.getLastToken = function (type){
    for( var i=this.buffer.length-1;i>=0;i--) {
      if (this.buffer[i][0].type.match(type)) {
        return this.buffer[i][0]
      }
    }
    return null
  }

  this.shift = function (){
    var chunk = this.buffer.shift()
    this.strBuffer = this.strBuffer.substr(chunk[0].str.length)
    return chunk[0]
  }

  this.pop = function (){
    var chunk = this.buffer.pop()
    if (chunk) {
      this.strBuffer = this.strBuffer.substr(0, this.strBuffer.length-chunk[0].str.length)
    }
    return chunk[0]
  }

  this.slice = function (){
    var sub = new StreamBuffer2(that.stream)
    sub.buffer = this.buffer.slice.apply(this.buffer, arguments)
    // this won t detect white nodes
    // can read count of white nodes in `sub`
    // to re splice again of that amount of nodes.

    sub.updateChanges__()

    return sub
  }

  this.reverse = function (){
    this.buffer.reverse()
    this.updateChanges__()
    return this
  }

  this.splice = function (){
    var sub = new StreamBuffer2(that.stream)
    sub.buffer = [].splice.apply(this.buffer, arguments)
    // this won t detect white nodes
    // can read count of white nodes in `sub`
    // to re splice again of that amount of nodes.


    sub.updateChanges__()
    this.updateChanges__()

    return sub
  }

  this.concat = function (buf){
    var that = this
    buf.forEach(function (chunk) {
      that.append(chunk)
    })
    return this
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
/**
 * Helper to produce test and samples
 * @param fn
 * @param append
 * @returns {*|number}
 */
function multilineToStream(fn, append){
  var str = multiline.stripIndent(fn) + (append||'')
  //console.log('----'+str+'----')
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
    this.push(chunk.str)
    callback()
  })
}
