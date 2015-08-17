
var _ = require('underscore')
var through2 = require('through2')
require('should')
var mds = require('../index')
var multilineToStream = mds.utils.multilineToStream

describe('normalizeFrontSpace transformer', function () {

  it.skip('can split any string to a TokenString', function (done) {
    multilineToStream(function () {/*

     # methods

     ``` js
     var resumer = require('resumer')
     ```

     ``` js
        var resumer = require('resumer')
     ```
     */})
      .pipe(mds.toTokenString())
      .pipe(mds.byLine())
      .pipe(mds.applyLineBlock('linecodeblock', /^([ ]{4})/i))
      .pipe(mds.byWord('pre'))
      .pipe(mds.applyTagBlock('codeblock', /[`]{3}/, true))
      .pipe(mds.controlLength(400, '```'))
      .pipe(mds.byWord('pre'))
      .pipe(mds.applyTagBlock('inlinecode', '`'))
      .pipe(mds.controlLength(150, '`'))
      .pipe(mds.extractBlock('codeblock', mds.cleanBlock()))
      .pipe(mds.extractBlock('inlinecode', mds.cleanBlock()))
      .pipe(mds.extractBlock('linecodeblock', mds.cleanBlock('')))
      //
      .pipe(mds.extractBlock('codeblock', mds.normalizeFrontSpace()))
      //.pipe(extractBlock('codeblock', fence(4, 0)))
      //
      //.pipe(extractBlock('linecodeblock', normalizeFrontSpace()))
      //.pipe(extractBlock('linecodeblock', fence(4)))
      .pipe(through2.obj(function(chunk,_,cb){
        //console.log(chunk.tokens)
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
