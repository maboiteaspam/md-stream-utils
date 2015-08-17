
var _ = require('underscore')
var through2 = require('through2')
require('should')

var thisUtils = require('../lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var TokenString = require('../lib/token-string.js')
var toTokenString = require('../lib/to-token-string.js')
var byWord = require('../lib/by-word.js')
var applyTagBlock = require('../lib/apply-tag-block.js')
var flattenToString = require('../lib/flatten-to-string.js')

describe('applyTagBlock transformer', function () {

  it.skip('can detect and apply a line block structure to the stream', function (done) {
    multilineToStream(function () {/*

     __md-colorize:__ A binary tool to colorize Markdown content.

     md-colorize [inputfile [outputfile]]

     + Display 'Usage' section from `stdin` with color:

     `cat README.md | md-paragraph -c 'Usage' | md-colorize`

     + Display 'Usage' section from a `file` with color:

     `md-paragraph -c 'Usage' README.md | md-colorize`


     ## API

     `md-stream-utils` comes with several stream transform modules.

     ```js
     module.exports = {
     tokenizer: function(){
     return mdTok();
     },
     toString: require("./lib/to-string"),
     flatten: require("./lib/flatten"),
     filter: require("./lib/filter")
     }
     ```

     __byLine__

     - Transforms a `stream of nodes` into a `stream of array of nodes`.
     - Each push represents a line.
     */})
      .pipe(toTokenString())
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('codeblock', /[`]{3}/, true))
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('codeblock', /[`]{1}/))
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('emphasis', /[`-]{1}/))
      .pipe(through2.obj(function(chunk,_,cb){
        this.push(chunk)
        cb()
      }))
      .on('end', function(){
        console.log('')// prevent mocha to eat the last line when it is not a \n.
        setTimeout(function(){done()},10)
      })
      .pipe(through2.obj(function(c,_,cb){cb()}))
      .pipe(process.stdout)
  })

  it('can detect and apply a line block structure to the stream', function (done) {
    var expected = [
      [
        { type: 'start:emphasis', power: 2, tokenStr: '__', str: '' },
        { type: 'token:emphasis', str: '_' },
        { type: 'token:emphasis', str: '_' },
        { type: 'text', str: 'm' },
        { type: 'text', str: 'd' },
        { type: 'text', str: '-' },
        { type: 'text', str: 's' },
        { type: 'text', str: 't' },
        { type: 'text', str: 'r' },
        { type: 'text', str: 'e' },
        { type: 'text', str: 'a' },
        { type: 'text', str: 'm' },
        { type: 'text', str: '-' },
        { type: 'text', str: 'u' },
        { type: 'text', str: 't' },
        { type: 'text', str: 'i' },
        { type: 'text', str: 'l' },
        { type: 'text', str: 's' },
        { type: 'token:emphasis', str: '_' },
        { type: 'token:emphasis', str: '_' },
        { type: 'end:emphasis', power: 2, tokenStr: '__', str: '' }
      ]
    ]
    multilineToStream(function () {/*
     __md-stream-utils__
     */})
      .pipe(toTokenString())
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('emphasis', /__/))
      .pipe(through2.obj(function(chunk,_,cb){
        (expected.shift() || []).forEach(function (e) {
          var cChunk = chunk.shift()
          Object.keys(e).forEach(function (p) {
            cChunk[p].should.eql(e[p])
          })
        })
        this.push(chunk)
        cb()
      }))
      .on('end', function(){
        console.log('')// prevent mocha to eat the last line when it is not a \n.
        setTimeout(function(){done()},10)
      })
      .pipe(through2.obj(function(c,_,cb){cb()}))
      .pipe(process.stdout)
  })

  it('can detect and apply a line block structure to the stream', function (done) {
    var expected = [
      [ { type: 'text', str: 'd' } ],
      [ { type: 'text', str: ' ' } ],
      [ { type: 'start:emphasis', power: 2, tokenStr: '__', str: '' },
        { type: 'token:emphasis', str: '_' },
        { type: 'token:emphasis', str: '_' },
        { type: 'text', str: 'm' },
        { type: 'text', str: 'd' },
        { type: 'start:emphasis', power: 1, tokenStr: '-', str: '' },
        { type: 'token:emphasis', str: '-' },
        { type: 'text', str: 's' },
        { type: 'text', str: 't' },
        { type: 'text', str: 'r' },
        { type: 'text', str: 'e' },
        { type: 'text', str: 'a' },
        { type: 'text', str: 'm' },
        { type: 'token:emphasis', str: '-' },
        { type: 'end:emphasis', power: 1, tokenStr: '-', str: '' },
        { type: 'text', str: 'u' },
        { type: 'text', str: 't' },
        { type: 'text', str: 'i' },
        { type: 'text', str: 'l' },
        { type: 'text', str: 's' },
        { type: 'token:emphasis', str: '_' },
        { type: 'token:emphasis', str: '_' },
        { type: 'end:emphasis', power: 2, tokenStr: '__', str: '' }
      ],
      [ { type: 'text', str: '\n' },
        { type: 'text', str: '*' },
        { type: 'text', str: 'd' },
        { type: 'text', str: 'f' },
        { type: 'text', str: '*' }
      ]
    ]
    multilineToStream(function () {/*
     d __md-stream-utils__
     *df*
     */})
      .pipe(toTokenString())
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('emphasis', '-'))
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('emphasis', '__'))
      .pipe(through2.obj(function(chunk,_,cb){
        (expected.shift() || []).forEach(function (e) {
          var cChunk = chunk.shift()
          Object.keys(e).forEach(function (p) {
            cChunk[p].should.eql(e[p])
          })
        })
        this.push(chunk)
        cb()
      }))
      .on('end', function(){
        console.log('')// prevent mocha to eat the last line when it is not a \n.
        setTimeout(function(){done()},10)
      })
      .pipe(through2.obj(function(c,_,cb){cb()}))
      .pipe(process.stdout)
  })

  it('can detect and apply a line block structure to the stream', function (done) {
    var expected = [
      [ { type: 'text', str: 'd' } ],
      [ { type: 'text', str: ' ' } ],
      [ { type: 'start:emphasis', power: 2, tokenStr: '__', str: '' },
        { type: 'token:emphasis', str: '_' },
        { type: 'token:emphasis', str: '_' },
        { type: 'text', str: 'm' },
        { type: 'text', str: 'd' },
        { type: 'text', str: '-' },
        { type: 'text', str: 's' },
        { type: 'text', str: 't' },
        { type: 'text', str: 'r' },
        { type: 'text', str: 'e' },
        { type: 'text', str: 'a' },
        { type: 'text', str: 'm' },
        { type: 'text', str: '-' },
        { type: 'text', str: 'u' },
        { type: 'text', str: 't' },
        { type: 'text', str: 'i' },
        { type: 'text', str: 'l' },
        { type: 'text', str: 's' },
        { type: 'token:emphasis', str: '_' },
        { type: 'token:emphasis', str: '_' },
        { type: 'end:emphasis', power: 2, tokenStr: '__', str: '' } ]
    ]
    multilineToStream(function () {/*
     d __md-stream-utils__
     */})
      .pipe(toTokenString())
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('emphasis', '__'))
      .pipe(through2.obj(function(chunk,_,cb){
        (expected.shift() || []).forEach(function (e) {
          var cChunk = chunk.shift()
          Object.keys(e).forEach(function (p) {
            cChunk[p].should.eql(e[p])
          })
        })
        this.push(chunk)
        cb()
      }))
      .on('end', function(){
        console.log('')// prevent mocha to eat the last line when it is not a \n.
        setTimeout(function(){done()},10)
      })
      .pipe(through2.obj(function(c,_,cb){cb()}))
      .pipe(process.stdout)
  })

  it('can detect and apply a line block structure to the stream', function (done) {
    var expected = [
      [ { type: 'text', str: 'd' } ],
      [ { type: 'text', str: ' ' },
        { type: 'start:emphasis', power: 2, tokenStr: '__', str: '' },
        { type: 'token:emphasis', str: '_' },
        { type: 'token:emphasis', str: '_' },
        { type: 'text', str: 'm' },
        { type: 'text', str: 'd' },
        { type: 'text', str: '-' },
        { type: 'text', str: 's' },
        { type: 'text', str: 't' },
        { type: 'text', str: 'r' },
        { type: 'text', str: 'e' },
        { type: 'text', str: 'a' },
        { type: 'text', str: 'm' },
        { type: 'text', str: '-' },
        { type: 'text', str: 'u' },
        { type: 'text', str: 't' },
        { type: 'text', str: 'i' },
        { type: 'text', str: 'l' },
        { type: 'text', str: 's' },
        { type: 'token:emphasis', str: '_' },
        { type: 'token:emphasis', str: '_' },
        { type: 'end:emphasis', power: 2, tokenStr: '__', str: '' } ],
      [ { type: 'text', str: '\n' } ],
      [ { type: 'start:emphasis', power: 1, tokenStr: '*', str: '' },
        { type: 'token:emphasis', str: '*' },
        { type: 'text', str: 'd' },
        { type: 'text', str: 'f' },
        { type: 'token:emphasis', str: '*' },
        { type: 'end:emphasis', power: 1, tokenStr: '*', str: '' } ]
    ]
    multilineToStream(function () {/*
     d __md-stream-utils__
     *df*
     */})
      .pipe(toTokenString())
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('emphasis', '__'))
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('emphasis', '*'))
      .pipe(through2.obj(function(chunk,_,cb){
        (expected.shift() || []).forEach(function (e) {
          var cChunk = chunk.shift()
          Object.keys(e).forEach(function (p) {
            cChunk[p].should.eql(e[p])
          })
        })
        this.push(chunk)
        cb()
      }))
      .on('end', function(){
        console.log('')// prevent mocha to eat the last line when it is not a \n.
        setTimeout(function(){done()},10)
      })
      .pipe(through2.obj(function(c,_,cb){cb()}))
      .pipe(process.stdout)
  })

  it('can detect and apply a line block structure to the stream', function (done) {
    var expected = [
      [ { type: 'text', str: 'd' } ],
      [ { type: 'text', str: ' ' } ],
      [ { type: 'start:emphasis', power: 2, tokenStr: '__', str: '' },
        { type: 'token:emphasis', str: '_' },
        { type: 'token:emphasis', str: '_' },
        { type: 'text', str: 'm' },
        { type: 'text', str: 'd' },
        { type: 'start:emphasis', power: 1, tokenStr: '-', str: '' },
        { type: 'token:emphasis', str: '-' },
        { type: 'text', str: 's' },
        { type: 'text', str: 't' },
        { type: 'text', str: 'r' },
        { type: 'text', str: 'e' },
        { type: 'text', str: 'a' },
        { type: 'text', str: 'm' },
        { type: 'token:emphasis', str: '-' },
        { type: 'end:emphasis', power: 1, tokenStr: '-', str: '' },
        { type: 'text', str: 'u' },
        { type: 'text', str: 't' },
        { type: 'text', str: 'i' },
        { type: 'text', str: 'l' },
        { type: 'text', str: 's' },
        { type: 'token:emphasis', str: '_' },
        { type: 'token:emphasis', str: '_' },
        { type: 'end:emphasis', power: 2, tokenStr: '__', str: '' } ],
      [ { type: 'text', str: '\n' },
        { type: 'start:emphasis', power: 1, tokenStr: '*', str: '' },
        { type: 'token:emphasis', str: '*' },
        { type: 'text', str: 'd' },
        { type: 'text', str: 'f' },
        { type: 'token:emphasis', str: '*' },
        { type: 'end:emphasis', power: 1, tokenStr: '*', str: '' } ]
    ];
    multilineToStream(function () {/*
     d __md-stream-utils__
     *df*
     */})
      .pipe(toTokenString())
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('emphasis', '*'))
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('emphasis', '-'))
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('emphasis', '__'))
      .pipe(through2.obj(function(chunk,_,cb){
        (expected.shift() || []).forEach(function (e) {
          var cChunk = chunk.shift()
          Object.keys(e).forEach(function (p) {
            cChunk[p].should.eql(e[p])
          })
        })
        this.push(chunk)
        cb()
      }))
      .on('end', function(){
        console.log('')// prevent mocha to eat the last line when it is not a \n.
        setTimeout(function(){done()},10)
      })
      .pipe(through2.obj(function(c,_,cb){cb()}))
      .pipe(process.stdout)
  })

})
