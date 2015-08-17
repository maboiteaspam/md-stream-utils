
var _ = require('underscore')
var through2 = require('through2')
require('should')
var mds = require('../index')
var multilineToStream = mds.utils.multilineToStream

describe('toTokenString transformer', function () {

  it('can split any string to a TokenString', function (done) {
    multilineToStream(function () {/*
     # md-stream-utils
     some
     line

     and whitespace   -
     to parse



     */})
      .pipe(mds.toTokenString())
      .pipe(through2.obj(function(chunk,_,cb){
        chunk.length().should.eql(1)
        chunk.strLength().should.eql(1)
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
