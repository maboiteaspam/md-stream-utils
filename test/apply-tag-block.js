
var _ = require('underscore')
var through2 = require('through2')
require('should')

var thisUtils = require('../lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var TokenString = require('../lib/token-string.js')
var toTokenString = require('../lib/to-token-string.js')
var byWord = require('../lib/by-word.js')
var applyTagBlock = require('../lib/apply-tag-block.js')

describe('applyLineBlock transformer', function () {

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
      .pipe(through2.obj(_.debounce(function(){done()}, 10)))
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
      .pipe(through2.obj(_.debounce(function(){done()}, 10)))
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
      .pipe(through2.obj(_.debounce(function(){done()}, 10)))
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
      .pipe(through2.obj(_.debounce(function(){done()}, 10)))
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
      .pipe(through2.obj(_.debounce(function(){done()}, 10)))
  })

})
