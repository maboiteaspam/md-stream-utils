#!/usr/bin/env node

var through2 = require("through2")
var fs = require('fs')
var chalk = require('chalk')
var _ = require('underscore')
var resumer = require('resumer')
var multiline = require("multiline")
RegExp.quote = require('regexp-quote')
RegExp.fromStr = function (str, flags){
  if (_.isString(str)) {
    return new RegExp(RegExp.quote(str), flags)
  }
  return str
}
RegExp.startsWith = function (str, flags){
  if (_.isString(str)) {
    return new RegExp('^'+RegExp.quote(str), flags)
  }
  return str
}
RegExp.endsWith = function (str, flags){
  if (_.isString(str)) {
    return new RegExp(RegExp.quote(str)+'$', flags)
  }
  return str
}
var argv = require('minimist')(process.argv.slice(2));


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

fs.createReadStream('README.md')

  .pipe(stringToStruct())

  //.pipe(pumpable.stream)

  .pipe(markPossibleTokens(['-','_','*','#','~','`']))

  .pipe(byLine())
  .pipe(applyLineBlock('heading', /^\s*(#{1,6})/i))
  .pipe(applyLineBlock('listitem', /^\s*([\-+]\s)/i))
  .pipe(applyLineBlock('listitem', /^\s*([0-9]+\.\s)/i))
  .pipe(regroupListItemsLines())
  .pipe(applyLineBlock('linecodeblock', /^([ ]{4})/i))

  .pipe(byWord('pre'))
  .pipe(applyTagBlock('codeblock', '```', true))
  .pipe(controlLength(400, '```'))
  .pipe(byWord('pre'))
  .pipe(applyTagBlock('inlinecode', '`'))
  .pipe(controlLength(150, '`'))
  .pipe(byWord('pre'))
  .pipe(applyTagBlock('emphasis', '~~'))
  .pipe(controlLength(50, '~~'))
  .pipe(byWord('pre'))
  .pipe(applyTagBlock('emphasis', '~'))
  .pipe(controlLength(50, '~'))
  .pipe(byWord('pre'))
  .pipe(applyTagBlock('emphasis', '--'))
  .pipe(controlLength(100, '--'))
  .pipe(byWord('pre'))
  .pipe(applyTagBlock('emphasis', '-'))
  .pipe(controlLength(100, '-'))
  .pipe(byWord('pre'))
  .pipe(applyTagBlock('emphasis', '**'))
  .pipe(controlLength(50, '**'))
  .pipe(byWord('pre'))
  .pipe(applyTagBlock('emphasis', '*'))
  .pipe(controlLength(50, '*'))
  .pipe(byWord('pre'))
  .pipe(applyTagBlock('emphasis', '__'))
  .pipe(controlLength(50, '__'))
  .pipe(byWord('pre'))
  .pipe(applyTagBlock('emphasis', '_'))
  .pipe(controlLength(50, '_'))
  //
  .pipe(extractBlock('inlinecode', cleanBlock()))
  .pipe(extractBlock('codeblock', cleanBlock()))
  .pipe(extractBlock('linecodeblock', cleanBlock('')))
  ////
  .pipe(extractBlock('heading', removeFrontSpace()))

  .pipe(extractBlock('codeblock', normalizeFrontSpace()))
  .pipe(extractBlock('codeblock', fence(4, 0)))

  .pipe(extractBlock('linecodeblock', normalizeFrontSpace()))
  .pipe(extractBlock('linecodeblock', fence(4)))

  .pipe(byWord('both'))
  .pipe(extractBlockWithWhitespace('heading', trimBlock('\n')))
  .pipe(whenBlock('heading', surroundBlock('\n\n\n', '\n\n')))
  .pipe(whenBlock('heading', onlyFirstBlock(trimBlock('\n', 'left'))))
  .pipe(whenBlock('heading', onlyFirstBlock(surroundBlock('\n', ''))))
  .pipe(through2.obj(function(chunk,_,cb){
    this.push(chunk)
    cb()
  }))
  //.pipe(extractBlockWithWhitespace('linecodeblock', function(chunk){
  //  console.log(chunk.tokens)
  //  console.log('--------------')
  //}))

  //
  //
  .pipe(removeToken('emphasis', /.+/))
  .pipe(removeToken('heading', /.+/))
  .pipe(removeToken('codeblock', /.+/))
  .pipe(removeToken('inlinecode', /.+/))

  //
  .pipe(extractBlock('heading', colorizeContent(chalk.cyan)))
  .pipe(extractBlock('linecodeblock', colorizeContent(chalk.white.italic)))
  .pipe(extractBlock('inlinecode', colorizeContent(chalk.underline)))
  .pipe(extractBlock('codeblock', colorizeContent(chalk.white.italic)))
  .pipe(extractBlock('listitem', colorizeToken(chalk.magenta.bold)))
  //
  .pipe(extractBlock('emphasis', /_/, colorizeContent(chalk.bold.yellow)))
  .pipe(extractBlock('emphasis', /-/, colorizeContent(chalk.blue)))
  .pipe(extractBlock('emphasis', /\*/, colorizeContent(chalk.magenta)))
  .pipe(extractBlock('emphasis', /~/, colorizeContent(chalk.magenta)))

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

function controlLength(max, extra) {
  return through2.obj(function(chunk, enc, callback){
    if(chunk.strLength()>max) {
      console.error('------------ ' + (extra || '') + ' ' +chunk.strLength())
      console.error( chunk.toString())
    }
    this.push(chunk)
    callback()

  })
}

function byLine() {
  var t; // should be a TokenString
  return through2.obj(function(chunk, enc, callback){

    if (!t) {
      t = chunk
    } else {
      t.concat(chunk)
    }

    if (t.match(/\n/)) {
      this.push(t)
      t=null
    }

    callback()

  }, function (callback) {
    if (t) {
      this.push(t)
      t=null
    }
    callback()
  })
}

function byWord(whitespace) {
  var t; // should be a TokenString
  return through2.obj(function(chunk, enc, callback){
    var that = this
    if (!t) {
      t = chunk
    } else {
      t.concat(chunk)
    }

    whitespace = 'pre'
    if (t.match(/\s/)) {
      var w = new TokenString()
      t.forEach(function (l) {
        if (!whitespace) {
          if (w.length()) {
            if (l.str.match(/\s/)) {
              if (w.match(/\S+/)) {
                that.push(w)
                w = new TokenString()
              }
            } else {
              if (w.match(/\s+/)) {
                that.push(w)
                w = new TokenString()
              }
            }
          }
        } else if(whitespace==='pre') {
          if (w.length()) {
            if (l.str.match(/\s/) && w.match(/\S+/)) {
              that.push(w)
              w = new TokenString()
            }
          }
        }

        w.append(l)

        if(whitespace==='post') {
          if (l.str.match(/\s/) && w.match(/\S+/)) {
            that.push(w)
            w = new TokenString()
          }
        }
      })
      t.clear()
      t.concat(w)
    }

    callback()

  }, function (callback) {
    if (t) {
      this.push(t)
      t=null
    }
    callback()
  })
}

function arrayToStruct() {
  var buf = new TokenStringBuffer()
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


function markPossibleTokens(tokens) {
  return through2.obj(function(chunk, enc, callback){
    if (tokens.indexOf(chunk.toString())>-1) {
      chunk.first().type = 'maybe:token'
    }
    this.push(chunk, enc)
    callback()
  })
}
function applyLineBlock(tag, token) {
  return through2.obj(function(chunk, enc, callback){
    if(chunk.strLength()>1) {
      var tokenMatch = chunk.match(RegExp.fromStr(token))
      if ( tokenMatch && tokenMatch.length) {
        if ( !chunk.slice(tokenMatch.index, tokenMatch[0].length).filterType('token:').length()) {
          var postNl = chunk.pop()
          var e = 0
          chunk.forEach(function(c, i){
            if (i>=tokenMatch.index
              && !c.type.match(/token:/)
              && c.str===tokenMatch[1][e]
              && e<tokenMatch[1].length) {
              c.type = 'token:'+tag
              e++
            }
          }).prepend({type:'start:'+tag, power: tokenMatch[1].length, tokenStr: tokenMatch[1]})
            .append({type:'end:'+tag, power: tokenMatch[1].length, tokenStr: tokenMatch[1]})
          if (postNl) chunk.append(postNl)

        }
      }
    }
    this.push(chunk, enc)
    callback()
  })
}
function regroupListItemsLines() {
  var regroupLines = function (lines){
    if (lines.split(/\n/).length>1) {
      var g = lines.lastIndexOfType('end:listitem')
      var end = lines.splice(g, 1).first()
      var insertIndex;
      lines.forEachReversed(function (c,i) {
        if (!insertIndex  && !c.str.match(/\s/)) {
          insertIndex = i
        }
      });
      if (insertIndex) {
        lines.insert(insertIndex, end)
      } else {
        lines.append(end)
      }
    }
  }
  var t;
  var isInBlock = false
  return through2.obj(function(chunk, enc, callback){
    if (!isInBlock && chunk.first().type.match(/^start:listitem/)) {
      isInBlock = true
      t = chunk
    } else if (isInBlock){

      if (chunk.first().type.match(/^start:listitem/)) {
        regroupLines(t)
        this.push(t)
        t = chunk
      } else {
        t.concat(chunk)
        if (t.match(/\n\n$/)) {
          regroupLines(t)
          this.push(t)
          isInBlock = false
          t = null
        } else {
          //console.log(chunk.tokens)
        }
      }

    } else {
      this.push(chunk, enc)
    }
    callback()
  })
}

function revealMarkup(tag) {
  return through2.obj(function(chunk, enc, callback){
    var toInsert = []
    chunk.forEach(function(c, i){
      if (c.type
        && c.type.match(/^(start|end)/)
        && c.type.match(tag)) {
        var str = '' + c.type
        if (c.type.match(/^(start)/)){
          str+='['+c.power+']'+'::'
        } else {
          str='::'+str
        }
        toInsert.push([i+1, {type:'text', str:str}])
      }
    })
    toInsert.forEach(function(p){
      chunk.insert(p[0], p[1])
    })
    this.push(chunk, enc)
    callback()
  })
}
function revealToken(tag) {
  return through2.obj(function(chunk, enc, callback){
    chunk.forEach(function(c, i){
      if (c.type
        && c.type.match(/^(token)/)
        && c.type.match(tag)) {
        c.str = chalk.underline.red(c.str)
      }
    })
    this.push(chunk, enc)
    callback()
  })
}


function applyTagBlock(tag, str, allowNewLines) {
  var okStr = RegExp.quote(str)

  var startToken = '['+okStr + ']{'+str.length+'}[^'+okStr+']+'
  var endToken = '['+okStr + ']{'+str.length+'}[^'+okStr+']+['+okStr + ']{'+str.length+'}[^'+okStr+']*$'

  var beginToken = new RegExp('^'+startToken)
  startToken = '^\\s+' + startToken
  endToken = '\\s+' + endToken
  startToken = new RegExp(startToken)
  endToken = new RegExp(endToken)

  var applyToken = function (tokenStr) {
    var e = 0
    tokenStr.forEach(function (c, i) {
      if (tokenStr.filterType('token:'+tag).length()<str.length) {
        if(str[e] && c.str===str[e]) {
          c.type = 'token:'+tag
          e++
        }
      }
    })
    e = str.length-1
    tokenStr.forEachReversed(function (c) {
      if (tokenStr.filterType('token:'+tag).length()<str.length*2) {
        if(str[e] && c.str===str[e]) {
          c.type = 'token:'+tag
          e--
        }
      }
    })

    tokenStr.insert(tokenStr.lastIndexOfType('token:'+tag)+1,
      {type:'end:'+tag, power: str.length, tokenStr: str, str:''})
    tokenStr.insert(tokenStr.indexOfType('token:'+tag),
      {type:'start:'+tag, power: str.length, tokenStr: str, str:''})
  }

  var browsed = 0;
  var t; // should be a TokenString
  return through2.obj(function(chunk, enc, callback){
    if (!t && chunk.match(browsed===0?beginToken:startToken)
      && !chunk.filterType('token:'+tag).length()) {
      t = chunk
      if (t.match(endToken)) {
        applyToken(t)
        this.push(t)
        t=null
      } else {
      }
    } else if (t){
      //if (chunk.filterType('token:'+tag).length()) console.log(chunk.tokens)
      t.concat(chunk)
      if (!allowNewLines && chunk.match(/\n/)) {
        this.push(t)
        t=null

      } else if (t.match(endToken)) {
        applyToken(t)
        this.push(t)
        t=null
      } else {
      }
    } else {
      this.push(chunk)
    }

    browsed++
    callback()

  }, function (callback) {
    if (t) {
      this.push(t)
      t=null
    }
    callback()
  })
}


function surroundBlock(open, close) {
  return function (buf) {
    open.split('').forEach(function(c){
      buf.prepend({type: 'text', str: c})
    })
    close.split('').forEach(function(c){
      buf.append({type: 'text', str: c})
    })
  }
}
function innerSurroundBlock(open, close) {
  return function (buf) {
    var head = buf.unshift()
    var foot = buf.pop()
    open.split('').forEach(function(c){
      buf.prepend({type: 'text', str: c})
    })
    buf.prepend(head)
    open.split('').forEach(function(c){
      buf.append({type: 'text', str: c})
    })
    buf.append(foot)
  }
}
function trimBlock(str, dir) {
  dir = dir || 'both'
  return function (buf) {
    if (['left', 'both'].indexOf(dir)>-1) buf.less(str)
    if (['right', 'both'].indexOf(dir)>-1) buf.tail(str)
  }
}
function cleanBlock(tokenEnd) {
  return function (buf) {
    var token = buf.filterType(/^start:/).first().tokenStr
    if (tokenEnd==null) {
      tokenEnd = token
    }
    buf.slice(1+token.length, -1-tokenEnd.length).forEach(function (c) {
      c.type = 'text'
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
            buf.splice(index, 1)
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
    firstLineSpaceCnt = regularSpaceCnt
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
          buf.splice(index+start, 0, {type: 'text', str: ' '})
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
  //var whitespace = false
  //if (_.isObject(token)) {
  //  whitespace = token.whitespace || whitespace
  //  token = token.token
  //}
  var isInBlock = false
  var t = new TokenString();
  return through2.obj(function(chunk, enc, callback){
    var that = this

    chunk.forEach(function (c) {
      if (c.type.match(/^start:/)
        && c.type.split(':')[1]===tag) {
        //var prespace;
        //if (['pre','both'].indexOf(''+whitespace)>-1) {
        //  prespace = t.less(/^\s$/)
        //}
        if(t.length()) that.push(t)
        t = new TokenString();
        t.append(c)
        isInBlock = true
      } else if (isInBlock
        && c.type.match(/^end:/)
        && c.type.split(':')[1]===tag) {
        //var postspace;
        //if (['post','both'].indexOf(''+whitespace)>-1) {
        //  postspace = t.tail(/^\s$/)
        //}
        t.append(c)
        //if (postspace && postspace.length()) console.log(postspace.tokens)
        if(then) then(t)
        isInBlock = false
        that.push(t)
        t = new TokenString();
      } else {
        t.append(c)
        if (!isInBlock && (t.match(/\n/))) {
          that.push(t)
          t = new TokenString();
        }
      }
    })
    callback()
  }, function (callback) {
    if (t) {
      this.push(t)
      t=null
    }
    callback()
  })
}

function extractBlockWithWhitespace(tag, token, then) {
  if (!then) {
    then = token
    token = null
  }
  var t = new TokenString();
  return through2.obj(function(chunk, enc, callback){
    var that = this

    chunk.forEach(function(c, i){

      if(c.type.match(/^start:/)
        && c.type.match(tag)
        && (!token || c.tokenStr.match(token))) {
        var tail = t.lessUntil(/\s/)
        if (tail.length()) that.push(tail)
        t = new TokenString()
        t.concat(chunk.splice(0, i+1))

      } else if(t.filterType('start:'+tag).length()) {

        if(c.type.match(/^end:/)
          && c.type.match(tag)
          && (!token || c.tokenStr.match(token))) {
          t.concat(chunk.splice(0, chunk.indexOfType('end:'+tag)+1))

        } else if (t.filterType('end:'+tag).length()) {

          if (!c.str || c.str.match(/\S+/)){
            if (then) then(t)
            that.push(t)
            t = new TokenString()
            var y = (new TokenString())
            y.append(c)
            that.push(y)
          } else {
            t.append(c)
          }
        }

      } else {
        if (c.str.match(/\s+/)) {
          if (t.match(/\S+/)) {
            that.push(t)
            t = new TokenString()
          }
        }
        t.append(c)
      }
    })

    callback()
  }, function (callback) {
    if (t) {
      this.push(t)
      t=null
    }
    callback()
  })
}
function whenBlock(tag, token, then) {
  if (!then) {
    then = token
    token = null
  }
  var t = new TokenString();
  var index = 0
  return through2.obj(function(chunk, enc, callback){
    if (chunk.length()) {
      if (chunk.indexOfType('start:'+tag)>-1
        && (!token || chunk.filterType('start:'+tag).tokenStr.match(token))) {
        then (chunk, index)
        index++;
      }
      this.push(chunk)
    }
    callback()
  }, function (callback) {
    if (t) {
      this.push(t)
      t=null
    }
    callback()
  })
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
    if (text.first()) {
      text.first().prepend = (text.first().prepend||'') + open
      text.last().append = close + (text.last().append||'')
    }
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
  return through2.obj(function(chunk, enc, callback){
    chunk.forEach(function(c, i){
      if (c.type==='token:'+tag && c.str.match(token)) {
        c.str=''
      }
    })
    this.push(chunk)
    callback()
  })
}
function removeToken(tag, token) {
  return through2.obj(function(chunk, enc, callback){
    var toRemove = []
    chunk.forEach(function(c, i){
      if (c.type==='token:'+tag && c.str.match(token)) {
        toRemove.push(i)
      }
    })
    toRemove.reverse().forEach(function(i){
      chunk.splice(i, 1)
    })
    this.push(chunk)
    callback()
  })
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


function TokenString(){

  var that = this

  var thisTokenIndex = 0
  this.tokens = []
  this.str = ''

  var finalizeToken = function (token) {
    !('str' in token) && (token.str = '');
    !('type' in token) && (token.type = '');
  }

  this.toString = function (){
    return this.str
  }

  this.append = function (chunk){
    finalizeToken(chunk)
    this.str += chunk.str
    this.tokens.push(chunk)
    return this
  }
  this.appendStr = function (strChunk, type){
    var that = this
    that.append({type: type || 'text', str: strChunk})
    return this
  }
  this.prepend = function (chunk){
    finalizeToken(chunk)
    this.str = chunk.str + this.str
    this.tokens.unshift(chunk)
    return this
  }
  this.prependStr = function (strChunk, type){
    var that = this
    that.prepend({type: type || 'text', str: strChunk})
    return this
  }

  this.match = function (content){
    return this.str.match(content)
  }
  this.strLength = function (){
    return this.str.length
  }
  this.substr = function (){
    return this.str.substr.apply(this.str, arguments)
  }

  this.shift = function (){
    var chunk = this.tokens.shift()
    if (chunk) {
      this.str = this.str.substr(chunk.str.length)
    }
    return chunk
  }
  this.pop = function (){
    var chunk = this.tokens.pop()
    if (chunk) {
      this.str = this.str.substr(0, this.str.length-chunk.str.length)
    }
    return chunk
  }
  this.insert = function (i, token){
    finalizeToken(token)
    this.splice(i, 0, token);
    return this
  }
  this.indexOfType = function (type){
    var i = -1
    this.forEach(function(c, e){
      if (i===-1 && c.type===type) {
        i = e
      }
    })
    return i
  }
  this.lastIndexOfType = function (type){
    var i = -1
    this.forEachReversed(function(c, e){
      if (i===-1 && c.type===type) {
        i = e
      }
    })
    return i
  }
  this.indexOf = function (str){
    var i = -1
    this.forEach(function(c, e){
      if (i===-1 && c.str===str) {
        i = e
      }
    })
    return i
  }
  this.lastIndexOf = function (str){
    var i = -1
    this.forEachReversed(function(c, e){
      if (i===-1 && c.str===str) {
        i = e
      }
    })
    return i
  }

  this.slice = function (){
    var args = [].slice.call(arguments);
    var sub = new TokenString()
    sub.concat([].slice.apply(this.tokens, args))
    // this won t detect white nodes
    // can read count of white nodes in `sub`
    // to re splice again of that amount of nodes.

    this.updateChanges__()

    return sub
  }
  this.splice = function (){
    var args = [].slice.call(arguments);
    var sub = new TokenString()
    sub.concat([].splice.apply(this.tokens, args))
    // this won t detect white nodes
    // can read count of white nodes in `sub`
    // to re splice again of that amount of nodes.

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
    this.tokens.reverse()
    this.updateChanges__()
    return this
  }
  this.filterType = function (t){
    var sub = new TokenString()
    this.forEach(function(c, i){
      if (c.type && c.type.match(t)) {
        sub.tokens.push(that.tokens[i])
      }
    })
    sub.updateChanges__()
    return sub
  }
  this.filterNotType = function (t){
    var sub = new TokenString()
    this.forEach(function(c, i){
      if (c.type && !c.type.match(t)) {
        sub.tokens.push(that.tokens[i])
      }
    })
    sub.updateChanges__()
    return sub
  }
  this.filterStr = function (t){
    var sub = new TokenString()
    this.forEach(function(c, i){
      if (c.str && c.str.match(t)) {
        sub.tokens.push(that.tokens[i])
      }
    })
    sub.updateChanges__()
    return sub
  }
  this.getLastToken = function (type){
    for( var i=this.tokens.length-1;i>=0;i--) {
      if (this.tokens[i].type.match(type)) {
        return this.tokens[i]
      }
    }
    return null
  }
  this.first = function (){
    if (this.tokens.length) {
      return this.tokens[0]
    }
    return null
  }
  this.last = function (){
    if (this.tokens.length) {
      return this.tokens[this.tokens.length-1]
    }
    return null
  }

  this.less = function (some){
    var k = false;
    var found = false;
    this.forEach(function(c, i){
      if (k===false) {
        if (c.str.match(some)) {
          found = true
        } else if(found){
          k = i
        }
      }
    })
    return k===false?new TokenString : this.splice(0, k)
  }
  this.tail = function (some){
    var k = false;
    var found = false;
    this.forEachReversed(function(c, i){
      if (k===false) {
        if (c.str.match(some)) {
          found = true
        } else if(found){
          k = i+1
        }
      }
    })
    return k===false?new TokenString : this.splice(k)
  }
  this.lessLength = function (l){
    return this.splice(0, l)
  }
  this.tailLength = function (l){
    return this.splice(this.length()-l)
  }
  this.lessUntil = function (some){
    var k = false;
    this.forEach(function(c, i){
      if (k===false && c.str.match(some)) {
        k=i
      }
    })
    return k===false?new TokenString : this.splice(0, k)
  }
  this.tailUntil = function (some){
    var k = false;
    this.forEachReversed(function(c, i){
      if (k===false && c.str.match(some)) {
        k = i+1
      }
    })
    return k===false?new TokenString : this.splice(k)
  }
  this.lessType = function (some){
    var k = false;
    this.forEach(function(c, i){
      if (k===false && !c.type.match(some)) {
        k=i
      }
    })
    return k===false?new TokenString : this.splice(0, k)
  }
  this.tailType = function (some){
    var k = false;
    this.forEachReversed(function(c, i){
      if (k===false && !c.type.match(some)) {
        k = i
      }
    })
    return k===false?new TokenString : this.splice(k)
  }
  this.lessUntilType = function (some){
    var k = false;
    this.forEach(function(c, i){
      if (k===false && !c.type.match(some)) {
        k=i
      }
    })
    return k===false?new TokenString : this.splice(0, k)
  }
  this.tailUntilType = function (some){
    var k = false;
    this.forEachReversed(function(c, i){
      if (k===false && !c.type.match(some)) {
        k = i
      }
    })
    return k===false?new TokenString : this.splice(k)
  }

  this.forEach = function (then){
    if (then) {
      var it = [].concat(this.tokens)
      for(var i=0;i<it.length;i++) {
        then(it[i], i)
      }
    }
    return this
  }
  this.forEachReversed = function (then){
    if (then) {
      var it = [].concat(this.tokens)
      for(var i=it.length-1;i>=0;i--) {
        then(it[i], i)
      }
    }
    return this
  }
  this.length = function (){
    return this.tokens.length
  }

  this.clear = function (){
    this.tokens = []
    this.str = []
    return this
  }


  this.updateChanges__ = function (){
    var s = ''
    this.tokens.forEach(function(c){
      s += c.str || ''
    })
    this.str = s
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
      var t = new TokenString()
      t.append({type: 'text', str: str})
      this.push(t)
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
    var that = this
    chunk.forEach(function (c) {
      that.push((c.prepend || '') + (c.str || '') + (c.append || ''))
    })
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

function getCallerLocation () {

  var path = require('path')
  var stack = new Error().stack.split('\n');
  stack.shift();stack.shift();stack.shift();
  var caller = stack.shift()
  if (!caller || !caller.length) {

    console.error('please report')
    console.error(new Error().stack)

    throw 'that is so weird.'
  }

  return caller;
}
