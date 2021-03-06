
var _ = require('underscore')
var through2 = require('through2')
require('should')
var mds = require('../index')
var multilineToStream = mds.utils.multilineToStream

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
      .pipe(mds.toTokenString())
      .pipe(mds.byWord())
      .pipe(through2.obj(function(chunk,_,cb){
        if (!expectSpace) chunk.match(/^\S+$/).length.should.eql(1)
        else chunk.match(/^\s+$/).length.should.eql(1)
        expectSpace = !expectSpace
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

  it('can split a stream by word, including pre whitespaces', function (done) {
    var first = true
    multilineToStream(function () {/*
     # md-stream-utils
     some
     line

     and whitespace   -
     to parse



     */})
      .pipe(mds.toTokenString())
      .pipe(mds.byWord('pre'))
      .pipe(through2.obj(function(chunk,_,cb){
        if (first) chunk.match(/^\S+$/).length.should.eql(1)
        else chunk.match(/^\s+\S*$/).length.should.eql(1)
        this.push(chunk)
        first = false
        cb()
      }))
      .on('end', function(){
        console.log('')// prevent mocha to eat the last line when it is not a \n.
        setTimeout(function(){done()},10)
      })
      .pipe(through2.obj(function(c,_,cb){cb()}))
      .pipe(process.stdout)
  })

  it('can split a stream by word, including post whitespaces', function (done) {
    multilineToStream(function () {/*
     # md-stream-utils
     some
     line

     and whitespace   -
     to parse



     */})
      .pipe(mds.toTokenString())
      .pipe(mds.byWord('post'))
      .pipe(through2.obj(function(chunk,_,cb){
        chunk.match(/\s+$/).length.should.eql(1)
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

  it.skip('can split a stream by word, excluding whitespaces', function (done) {
    multilineToStream(function () {/*
     # md-stream-utils
     some
     line

     and whitespace   -
     to parse



     */})
      .pipe(mds.toTokenString())
      .pipe(mds.byWord('both'))
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
})
