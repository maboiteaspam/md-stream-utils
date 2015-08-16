
var through2 = require('through2')
require('should')

var thisUtils = require('../lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var getCallerLocation = thisUtils.getCallerLocation
var TokenString = require('../lib/token-string.js')
var stringToStruct = require('../lib/to-token-string.js')
var byWord = require('../lib/by-word.js')

describe('byWord transformer', function () {

  it('can split a stream by word', function () {
    multilineToStream(function () {/*
     # md-stream-utils
     some
     line

     and whitespace   -
     to parse



     */})
      .pipe(stringToStruct())
      .pipe(byWord())
      .pipe(through2.obj(function(chunk,_,cb){
        console.log(chunk.tokens)
        this.push(chunk)
        cb()
      }))
  })
})
