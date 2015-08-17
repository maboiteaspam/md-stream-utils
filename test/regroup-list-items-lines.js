
var _ = require('underscore')
var through2 = require('through2')
require('should')

var thisUtils = require('../lib/utils.js')
var multilineToStream = thisUtils.multilineToStream
var applyTagBlock = require('../lib/apply-tag-block.js')
var TokenString = require('../lib/token-string.js')
var toTokenString = require('../lib/to-token-string.js')
var byLine = require('../lib/by-line.js')
var byWord = require('../lib/by-word.js')
var regroupListItemsLines = require('../lib/regroup-list-items-lines.js')
var applyLineBlock = require('../lib/apply-line-block.js')
var flattenToString = require('../lib/flatten-to-string.js')
var revealMarkup = require('../lib/reveal-markup.js')

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
      .pipe(toTokenString())
      .pipe(byLine())
      .pipe(applyLineBlock('listitem', /^\s*([\-+]\s)/i))
      .pipe(applyLineBlock('listitem', /^\s*([0-9]+\.\s)/i))
      .pipe(regroupListItemsLines())

      .pipe(byWord('pre')).pipe(applyTagBlock('codeblock', /[`]{3}/, true))
      .pipe(byWord('pre')).pipe(applyTagBlock('inlinecode', /[`]{1}/))

      .pipe(through2.obj(function(chunk,_,cb){
        this.push(chunk)
        cb()
      }))
      .pipe(revealMarkup('listitem'))
      .on('end', function(){
        console.log('')// prevent mocha to eat the last line when it is not a \n.
        setTimeout(function(){done()},10)
      })
      .pipe(through2.obj(function(c,_,cb){cb()}))
      .pipe(process.stdout)
  })
})
