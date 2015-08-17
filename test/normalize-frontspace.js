
var _ = require('underscore')
var through2 = require('through2')
require('should')

var thisUtils = require('../lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var TokenString = require('../lib/token-string.js')
var toTokenString = require('../lib/to-token-string.js')
var byLine = require('../lib/by-line.js')
var byWord = require('../lib/by-word.js')
var controlLength = require('../lib/control-length.js')
var applyTagBlock = require('../lib/apply-tag-block.js')
var regroupListItemsLines = require('../lib/regroup-list-items-lines.js')
var applyLineBlock = require('../lib/apply-line-block.js')
var extractBlock = require('../lib/extract-block.js')
var fence = require('../lib/fence.js')
var removeFrontSpace = require('../lib/remove-frontspace.js')
var normalizeFrontSpace = require('../lib/normalize-frontspace.js')
var cleanBlock = require('../lib/clean-block.js')
var flattenToString = require('../lib/flatten-to-string.js')

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
      .pipe(toTokenString())
      .pipe(byLine())
      .pipe(applyLineBlock('linecodeblock', /^([ ]{4})/i))
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('codeblock', /[`]{3}/, true))
      .pipe(controlLength(400, '```'))
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('inlinecode', '`'))
      .pipe(controlLength(150, '`'))
      .pipe(extractBlock('codeblock', cleanBlock()))
      .pipe(extractBlock('inlinecode', cleanBlock()))
      .pipe(extractBlock('linecodeblock', cleanBlock('')))
      //
      .pipe(extractBlock('codeblock', normalizeFrontSpace()))
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
