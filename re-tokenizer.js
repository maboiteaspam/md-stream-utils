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
//fs.createReadStream('bench.md')
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
  //.pipe(lineBlock('dash-list', '+'))
  //.pipe(lineBlock('dash-list', '-'))

  .pipe(emphasis('```', true))
  .pipe(emphasis('``', true))
  .pipe(emphasis('`', false))
  .pipe(emphasis('--', false,  '`'))
  .pipe(emphasis('-', false,  '`'))
  .pipe(emphasis('**', false,  '`'))
  .pipe(emphasis('*', false,  '`'))
  .pipe(emphasis('__', false,  '`'))
  .pipe(emphasis('_', false,  '`'))

  // for lost-tokens, those that looks likes token, but are not
  .pipe(through2.obj(function(chunk, enc, callback){
    if (chunk.type.match(/maybe:token/)) {
      chunk.str = chalk.red.bold(chunk.str)
    }
    this.push(chunk, enc)
    callback()
  }))

  .pipe(colorize('heading', chalk.cyan))
  .pipe(colorize('emphasis', chalk.white.italic, '`'))
  .pipe(colorize('emphasis', chalk.bold, '_'))
  .pipe(colorize('emphasis', chalk.blue, '-'))
  .pipe(colorize('emphasis', chalk.magenta, '*'))

  .pipe(hideToken(/[`_#-\*]+/))
  .pipe(afterBlock('heading','\n\n','\n'))
  .pipe(surroundBlock('==','', 'heading'))
  .pipe(surroundBlock('>>>','<<<', null, 'heading'))

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

  var stdin = process.stdin;
  stdin.setRawMode( true );
  stdin.pause();
  stdin.setEncoding( 'utf8' );
  var size = process.stdout.getWindowSize()
  var height = size[1]
  height--

  var wholeBuf = new StreamBuffer2()
  wholeBuf.startBuffer()

  var i = 0
  var lessBuf = new StreamBuffer2(through2.obj(function(chunk, enc, callback){
    wholeBuf.through(chunk)
    if (i<height) {
      this.push(chunk)
    }
    i++
    callback()
  }, function (callback) {
    //lessBuf.flush ()
    //callback() // it is un-finish-able stream
  }))

    var startLinePosition = 0

    var printToScreen = function(sub){
      require('readline').cursorTo(process.stdout, 0, 0)
      require('readline').clearScreenDown(process.stdout)
      sub.forEach(function (line) {
        line.originalToken.forEach(function (c) {
          lessBuf.append(c)
        })
        lessBuf.flush()
      })
      require('readline').cursorTo(process.stdout, 0, height)
    }

    var moveUp = function(){
      if (startLinePosition>0) {
        startLinePosition--
        var sub = wholeBuf.slice(startLinePosition, startLinePosition+height)
        printToScreen(sub)
      }
    }
    var moveDown = function(){
      if (startLinePosition+height<wholeBuf.buffer.length) {
        startLinePosition++
        var sub = wholeBuf.slice(startLinePosition, startLinePosition+height)
        printToScreen(sub)
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



function lineBlock(block, str, maxPower) {
  var buf = new StreamBuffer2()
  var okStr = str.match(/[\[\]*]/) ? str.replace(/([\[\]*])/g, '\\$1') : str
  var okNotStr = str.match(/[\[\]*]/) ? str[0].replace(/([\[\]*])/g, '\\$1') : str[0]
  maxPower = maxPower || str.length;
  var power;
  var hasFound;
  buf.onceStr(str, function () {
    buf.isBuffering = true
  })
  var regexp = '['+okStr+']{1,'+(maxPower)+'}[^'+okNotStr+']$'
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

  buf.startBuffer()
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
  if (!allowNewLines) {
    buf.onceStr('\n', function () {
      buf.flush()
    })
  }
  // this is to control buffering
  // this transforms is a bit special as it buffer since ever.
  // it looks backward for the entire pattern
  // as of sometimes it is multiline,
  // the buffer may end being not flushed soon enough.
  //
  // with this change, that should be fixed.
  buf.onceStr('\n', function () {
    var nl = buf.match(/\n/g)
    if (nl.length) {
      if (!buf.match(okStr)) buf.flush()
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
function colorize(bName, colorizer, token) {
  var buf = new StreamBuffer2()
  var okToken = token && token.match(/[\[\]*]/) ? token.replace(/([\[\]*])/g, '\\$1') : token
  var isInblock = false
  var hasSeenText = false
  buf.any(function (chunk) {
    if (!isInblock) {
      if (chunk.type.match('start:'+bName)) {
        isInblock = true
        hasSeenText = false
      }else if (chunk.type.match('end:'+bName)) {
        isInblock = false
      }
    } else {
      hasSeenText = hasSeenText || !chunk.type.match(/^token:/)

      if (chunk.type.match('end:'+bName)) {
        isInblock = false
      } else if (!hasSeenText
        && chunk.type.match(/^token:/)
        && !chunk.str.match(okToken)) {
        isInblock = false
        hasSeenText = false
      }
    }
  })
  buf.any(function (chunk) {
    if (isInblock) {
      if (chunk.str.length) chunk.str = colorizer(chunk.str)
    }
  })
  return buf.stream
}
function hideToken(token) {
  var buf = new StreamBuffer2()
  buf.startBuffer()
  buf.any(function (chunk) {
    if (chunk.type.match('token:') && chunk.str.match(token)) {
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
              if (!enough && c.type.match(/text/)) {
                if (trim && c.str.match(trim)) {
                  toDelete.push(i)
                } else {
                  enough = true
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
