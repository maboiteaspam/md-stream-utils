
var _ = require('underscore')
var through2 = require('through2')
require('should')

var thisUtils = require('../lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var revealMarkup = require('../lib/reveal-markup.js')
var flattenToString = require('../lib/flatten-to-string.js')
var TokenString = require('../lib/token-string.js')
var toTokenString = require('../lib/to-token-string.js')
var byLine = require('../lib/by-line.js')
var byWord = require('../lib/by-word.js')
var applyLineBlock = require('../lib/apply-line-block.js')
var applyTagBlock = require('../lib/apply-tag-block.js')
var controlLength = require('../lib/control-length.js')
var extractBlockWithWhitespace = require('../lib/extract-block-with-whitespace.js')

describe('extractBlockWithWhitespace transformer', function () {

  it.skip('can split any string to a TokenString', function (done) {
    multilineToStream(function () {/*
     qsdsqd


     ``` js
     var resumer = require('resumer');
     var s = createStream();
     s.pipe(process.stdout);

     function createStream () {
     var stream = resumer();
     stream.queue('beep boop\n');
     return stream;
     }
     ```

     ```sh
     $ node example/resume.js
     beep boop
     ```

     # methods

     ``` js
     var resumer = require('resumer')
     ```

     ## resumer(write, end)

     Return a new through stream from `write` and `end`, which default to
     pass-through `.queue()` functions if not specified.

     The stream starts out paused and will be resumed on the next tick unless you
     call `.pause()` first.

     `write` and `end` get passed directly through to
     [through](https://npmjs.org/package/through).

     # install

     With [npm](https://npmjs.org) do:

     ```
     npm install resumer
     ```
     */})
      .pipe(toTokenString())
      .pipe(byLine())
      .pipe(applyLineBlock('linecodeblock', /^([ ]{4})/i))

      .pipe(byWord('pre'))
      .pipe(applyTagBlock('codeblock', /[`]{3}/, true))

      .pipe(extractBlockWithWhitespace('codeblock', function(buf){
        //console.log(buf.tokens)
        buf.prependStr('ù')
        buf.appendStr('µ')
      }))
      .pipe(revealMarkup(/.*/))
      .pipe(flattenToString())
      .on('end', function(){
        console.log('')// prevent mocha to eat the last line when it is not a \n.
        setTimeout(function(){done()},10)
      })
      .pipe(process.stdout)
  })
})
