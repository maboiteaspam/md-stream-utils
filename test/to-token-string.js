
var _ = require('underscore')
var through2 = require('through2')
require('should')

var thisUtils = require('../lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var TokenString = require('../lib/token-string.js')
var toTokenString = require('../lib/to-token-string.js')

describe('toTokenString transformer', function () {

  it('can split any string to a TokenString', function (done) {
    multilineToStream(function () {/*
     # md-stream-utils
     some
     line

     and whitespace   -
     to parse



     */})
      .pipe(toTokenString())
      .pipe(through2.obj(function(chunk,_,cb){
        chunk.length().length.should.eql(1)
        chunk.strLength().length.should.eql(1)
        this.push(chunk)
        cb()
      }))
      .pipe(through2.obj(_.debounce(function(){done()}, 100)))
  })
})
