
var _ = require('underscore')
var through2 = require('through2')
require('should')
var mds = require('../index')
var multilineToStream = mds.utils.multilineToStream

describe('regroupListItemsLines transformer', function () {

  it.skip('can split any string to a TokenString', function (done) {
    multilineToStream(function () {/*


     ## Styles

     ### Modifiers

     - `reset`
     - `bold`
     - `dim`
     - `italic` *(not widely supported)*
     - `underline`
     - `inverse`
     - `hidden`
     - `strikethrough` *(not widely supported)*

     ### Colors

     - `black`
     - `red`
     - `green`
     - `yellow`
     - `blue` *(on Windows the bright version is used as normal blue is illegible)*
     - `magenta`
     - `cyan`
     - `white`
     - `gray`

     ### Background colors

     - `bgBlack`
     - `bgRed`
     - `bgGreen`
     - `bgYellow`
     - `bgBlue`
     - `bgMagenta`
     - `bgCyan`
     - `bgWhite`

     */})
      .pipe(mds.toTokenString())
      .pipe(mds.byLine())
      .pipe(mds.applyLineBlock('listitem', /^\s*([\-+]\s)/i))
      .pipe(mds.applyLineBlock('listitem', /^\s*([0-9]+\.\s)/i))
      .pipe(mds.regroupListItemsLines())

      .pipe(mds.byWord('pre')).pipe(mds.applyTagBlock('codeblock', /[`]{3}/, true))
      .pipe(mds.byWord('pre')).pipe(mds.applyTagBlock('inlinecode', /[`]{1}/))

      .pipe(through2.obj(function(chunk,_,cb){
        this.push(chunk)
        cb()
      }))
      .pipe(mds.revealMarkup('listitem'))
      .on('end', function(){
        console.log('')// prevent mocha to eat the last line when it is not a \n.
        setTimeout(function(){done()},10)
      })
      .pipe(through2.obj(function(c,_,cb){cb()}))
      .pipe(process.stdout)
  })
})
