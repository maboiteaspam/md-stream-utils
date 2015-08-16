
var _ = require('underscore')
var through2 = require('through2')
require('should')

var thisUtils = require('../lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var TokenString = require('../lib/token-string.js')
var toTokenString = require('../lib/to-token-string.js')
var byWord = require('../lib/by-word.js')

describe('byWord transformer', function () {

  it('can split a stream by word, excluding whitespaces', function (done) {
    var expectSpace = false
    multilineToStream(function () {/*
     # md-stream-utils
     some
     line

     and whitespace   -
     to parse



     */})
      .pipe(toTokenString())
      .pipe(byWord())
      .pipe(through2.obj(function(chunk,_,cb){
        if (!expectSpace) chunk.match(/^\S+$/).length.should.eql(1)
        else chunk.match(/^\s+$/).length.should.eql(1)
        expectSpace = !expectSpace
        this.push(chunk)
        cb()
      }))
      .pipe(through2.obj(_.debounce(function(){done()}, 10)))
  })

  it('can split a stream by word, including pre whitespaces', function (done) {
    var first = true
    multilineToStream(function () {/*
     # md-stream-utils
     some
     line

     and whitespace   -
     to parse



     */})
      .pipe(toTokenString())
      .pipe(byWord('pre'))
      .pipe(through2.obj(function(chunk,_,cb){
        if (first) chunk.match(/^\S+$/).length.should.eql(1)
        else chunk.match(/^\s+\S*$/).length.should.eql(1)
        this.push(chunk)
        first = false
        cb()
      }))
      .pipe(through2.obj(_.debounce(function(){done()}, 10)))
  })

  it('can split a stream by word, including post whitespaces', function (done) {
    multilineToStream(function () {/*
     # md-stream-utils
     some
     line

     and whitespace   -
     to parse



     */})
      .pipe(toTokenString())
      .pipe(byWord('post'))
      .pipe(through2.obj(function(chunk,_,cb){
        chunk.match(/\s+$/).length.should.eql(1)
        this.push(chunk)
        cb()
      }))
      .pipe(through2.obj(_.debounce(function(){done()}, 10)))
  })
})
