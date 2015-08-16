
var _ = require('underscore')
var through2 = require('through2')
require('should')

var thisUtils = require('../lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var TokenString = require('../lib/token-string.js')
var toTokenString = require('../lib/to-token-string.js')
var byLine = require('../lib/by-line.js')
var applyLineBlock = require('../lib/apply-line-block.js')

describe('applyLineBlock transformer', function () {

  it('can detect and apply a line block structure to the stream', function (done) {
    multilineToStream(function () {/*
     # md-stream-utils
     */})
      .pipe(toTokenString())
      .pipe(byLine())
      .pipe(applyLineBlock('heading', /^\s*(#{1,6})/i))
      .pipe(through2.obj(function(chunk,_,cb){
        chunk.shift().type.should.eql('start:heading')
        chunk.lessType(/token:heading/).length().should.eql(1)
        chunk.pop().type.should.eql('end:heading')
        chunk.length().should.eql(' md-stream-utils'.length)
        chunk.strLength().should.eql(' md-stream-utils'.length)
        this.push(chunk)
        cb()
      }))
      .pipe(through2.obj(_.debounce(function(){done()}, 10)))
  })

  it('fixture test #1', function (done) {
    var expected = [
      [ { type: 'text', str: '\n' } ],
      [ { type: 'start:heading', power: 1, tokenStr: '#', str: '' },
        { type: 'token:heading', str: '#' },
        { type: 'text', str: ' ' },
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
        { type: 'end:heading', power: 1, tokenStr: '#', str: '' },
        { type: 'text', str: '\n' } ],
      [ { type: 'text', str: '\n' } ],
      [ { type: 'start:heading', power: 2, tokenStr: '##', str: '' },
        { type: 'token:heading', str: '#' },
        { type: 'token:heading', str: '#' },
        { type: 'text', str: ' ' },
        { type: 'text', str: 's' },
        { type: 'text', str: 'e' },
        { type: 'text', str: 'c' },
        { type: 'text', str: 'o' },
        { type: 'text', str: 'n' },
        { type: 'text', str: 'd' },
        { type: 'text', str: ' ' },
        { type: 'text', str: 'h' },
        { type: 'text', str: 'e' },
        { type: 'text', str: 'a' },
        { type: 'text', str: 'd' },
        { type: 'text', str: 'i' },
        { type: 'text', str: 'n' },
        { type: 'text', str: 'g' },
        { type: 'end:heading', power: 2, tokenStr: '##', str: '' } ]
    ]
    multilineToStream(function () {/*

     # md-stream-utils

     ## second heading
     */})
      .pipe(toTokenString())
      .pipe(byLine())
      .pipe(applyLineBlock('heading', /^\s*(#{1,6})/i))
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
      .pipe(through2.obj(_.debounce(function(){done()}, 10)))
  })

  it('fixture test #2', function (done) {
    var stream = through2()
    stream.pipe(toTokenString())
      .pipe(byLine())
      .pipe(applyLineBlock('heading', /^([ ]{4})/))
      .pipe(through2.obj(function(chunk,_,cb){
        console.log(chunk.tokens)
        this.push(chunk)
        cb()
      }))
      .pipe(through2.obj(_.debounce(function(){done()}, 10)));
    stream.write(
      'd\n' +
      '\n    dsdfsdf sdfsdfs' +
      '\n    ' +
      '\n    ssfdfsdfds' +
      '\nd'
    )
    stream.end()
  })
})
