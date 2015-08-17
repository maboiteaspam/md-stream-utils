
var _ = require('underscore')
var through2 = require('through2')
require('should')
var mds = require('../index')
var multilineToStream = mds.utils.multilineToStream

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
      .pipe(mds.toTokenString())
      .pipe(mds.byLine())
      .pipe(mds.applyLineBlock('linecodeblock', /^([ ]{4})/i))

      .pipe(mds.byWord('pre'))
      .pipe(mds.applyTagBlock('codeblock', /[`]{3}/, true))
      .pipe(mds.controlLength(400, '```'))
      .pipe(mds.byWord('pre'))
      .pipe(mds.applyTagBlock('inlinecode', '`'))
      .pipe(mds.controlLength(150, '`'))


      .pipe(mds.extractBlock('codeblock', function(buf){
        mds.getBlockContent(mds.trimBlock('\n', 'right'))(buf)
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
