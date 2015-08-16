
var through2 = require('through2')
require('should')

var thisUtils = require('../lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var getCallerLocation = thisUtils.getCallerLocation
var TokenString = require('../lib/token-string.js')
var stringToStruct = require('../lib/to-token-string.js')
var byLine = require('../lib/by-line.js')

describe('byLine transformer', function () {

  it('can split a stream by line', function () {
    multilineToStream(function () {/*
     # md-stream-utils
     some
     line

     and whitespace   -
     to parse



     */})
      .pipe(stringToStruct())
      .pipe(byLine())
      .pipe(through2.obj(function(chunk,_,cb){
        chunk.str.should.match(/\n$/)
        chunk.last().str.should.match(/^\n$/)
        chunk.match(/(\n)$/)[0].should.eql('\n')
        this.push(chunk)
        cb()
      }))
  })

  it('can flush the remaining as a packed stream', function () {
    multilineToStream(function () {/*
    # md-stream-utils
    */})
      .pipe(stringToStruct())
      .pipe(byLine())
      .pipe(through2.obj(function(chunk,_,cb){
        chunk.str.should.match(/^# md-stream-utils$/)
        chunk.last().str.should.match(/^s$/)
        chunk.match(/^# md-stream-utils$/)[0].should.eql('# md-stream-utils')
        this.push(chunk)
        cb()
      }))
  })
})
