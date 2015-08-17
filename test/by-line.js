
var _ = require('underscore')
var through2 = require('through2')
require('should')
var mds = require('../index')
var multilineToStream = mds.utils.multilineToStream

describe('byLine transformer', function () {

  it('can split a stream by line', function (done) {
    multilineToStream(function () {/*
     # md-stream-utils
     some
     line

     and whitespace   -
     to parse



     */})
      .pipe(mds.toTokenString())
      .pipe(mds.byLine())
      .pipe(through2.obj(function(chunk,_,cb){
        chunk.str.should.match(/\n$/)
        chunk.last().str.should.match(/^\n$/)
        chunk.match(/(\n)$/)[0].should.eql('\n')
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

  it('can flush the remaining as a packed stream', function (done) {
    multilineToStream(function () {/*
    # md-stream-utils
    */})
      .pipe(mds.toTokenString())
      .pipe(mds.byLine())
      .pipe(through2.obj(function(chunk,_,cb){
        chunk.str.should.match(/^# md-stream-utils$/)
        chunk.last().str.should.match(/^s$/)
        chunk.match(/^# md-stream-utils$/)[0].should.eql('# md-stream-utils')
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
