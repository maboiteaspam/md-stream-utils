
var _ = require('underscore')
var through2 = require('through2')
require('should')

var thisUtils = require('../lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var TokenString = require('../lib/token-string.js')
var toTokenString = require('../lib/to-token-string.js')
var byLine = require('../lib/by-line.js')
var byWord = require('../lib/by-word.js')
var applyLineBlock = require('../lib/apply-line-block.js')
var getBlockContent = require('../lib/get-block-content.js')
var extractBlock = require('../lib/extract-block.js')
var trimBlock = require('../lib/trim-block.js')
var applyTagBlock = require('../lib/apply-tag-block.js')
var controlLength = require('../lib/control-length.js')
var flattenToString = require('../lib/flatten-to-string.js')

describe('getBlockContent transformer', function () {

  it.skip('can split any string to a TokenString', function (done) {
    multilineToStream(function () {/*

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
      .pipe(controlLength(400, '```'))
      .pipe(byWord('pre'))
      .pipe(applyTagBlock('inlinecode', '`'))
      .pipe(controlLength(150, '`'))


      .pipe(extractBlock('codeblock', function(buf){
        getBlockContent(trimBlock('\n', 'right'))(buf)
        console.log(buf.tokens)
      }))
      .on('end', function(){
        console.log('')// prevent mocha to eat the last line when it is not a \n.
        setTimeout(function(){done()},10)
      })
      .pipe(through2.obj(function(c,_,cb){cb()}))
      .pipe(process.stdout)
  })
})
