#!/usr/bin/env node

var through2 = require("through2")
var fs = require('fs')
var chalk = require('chalk')
var _ = require('underscore')
var mds = require('./index')
RegExp = mds.RegExp

var argv = require('minimist')(process.argv.slice(2));

var TokenString = mds.TokenString
var multilineToStream = mds.utils.multilineToStream

fs.createReadStream('README.md');
fs.createReadStream('test/fixtures/chalk.md');
fs.createReadStream('test/fixtures/changelog-maker.md');
fs.createReadStream('test/fixtures/resumer.md');

var pumpable = new mds.PausableStream()
pumpable.pause()

fs.createReadStream('README.md')
  .pipe(mds.toTokenString())

  .pipe(pumpable.stream)

  .pipe(mds.byLine())
  .pipe(mds.applyLineBlock('heading', /^\s*(#{1,6})/i))
  .pipe(mds.applyLineBlock('listitem', /^\s*([\-+*]\s)/i))
  .pipe(mds.applyLineBlock('listitem', /^\s*([0-9]+\.\s)/i))
  .pipe(mds.regroupListItemsLines())
  .pipe(mds.applyLineBlock('linecodeblock', /^([ ]{4})/i))
  .pipe(mds.applyTagBlock('codeblock', /[`]{3}/, true))
  .pipe(mds.applyTagBlock('inlinecode', /[`]{1}/))
  .pipe(mds.applyTagBlock('emphasis', /[~]{2}/))
  .pipe(mds.applyTagBlock('emphasis', /[~]{1}/))
  .pipe(mds.applyTagBlock('emphasis', /[~]{2}/))
  .pipe(mds.applyTagBlock('emphasis', /[*]{2}/))
  .pipe(mds.applyTagBlock('emphasis', /[*]{1}/))
  .pipe(mds.applyTagBlock('emphasis', /[_]{2}/))
  .pipe(mds.applyTagBlock('emphasis', /[_]{1}/))

  .pipe(mds.extractBlock('codeblock', mds.cleanBlock()))
  .pipe(mds.extractBlock('inlinecode', mds.cleanBlock()))
  .pipe(mds.extractBlock('linecodeblock', mds.cleanBlock('')))

  .pipe(mds.extractBlock('heading', mds.getBlockContent(mds.removeFrontspace())))
  .pipe(mds.extractBlock(/listitem/, mds.getBlockContent(mds.removeFrontspace())))

  .pipe(mds.extractBlock('codeblock', mds.normalizeFrontspace()))


  .pipe(mds.extractBlock('codeblock', mds.getBlockContent(mds.fence(function () {return [4,0]}))))

  .pipe(mds.extractBlock(/listitem/, function(buf) {
      var t = buf.first().tokenStr.length;
      buf.prependStr(' ')
      mds.getBlockContent(mds.fence(function () {return [t+1, 0]}))(buf)
    }
  ))

  .pipe(mds.removeToken('heading', /.+/))
  .pipe(mds.removeToken('codeblock', /.+/))
  .pipe(mds.removeToken('inlinecode', /.+/))
  .pipe(mds.removeToken('emphasis', /.+/))


  .pipe(mds.extractBlock('linecodeblock', mds.colorizeContent(chalk.white.italic)))
  .pipe(mds.extractBlock('inlinecode', mds.colorizeContent(chalk.white.italic)))
  .pipe(mds.extractBlock('codeblock', mds.colorizeContent(chalk.white.italic)))
  .pipe(mds.extractBlock('emphasis', /_/, mds.colorizeContent(chalk.bold)))
  .pipe(mds.extractBlock('emphasis', /\*/, mds.colorizeContent(chalk.bold)))
  .pipe(mds.extractBlock('emphasis', /~/, mds.colorizeContent(chalk.strikethrough)))
  .pipe(mds.extractBlock('listitem', mds.colorizeToken(chalk.magenta.bold)))
  .pipe(mds.extractBlock('heading', mds.colorizeContent(chalk.bold.underline.cyan)))

  .pipe(mds.less(pumpable))

  .pipe(mds.flattenToString(mds.resolveColors.transform))
  .pipe(process.stdout)
  .on('end', function(){})


function onlyFirstBlock(cb) {
  var i = 0
  return function(buf){
    if (i<1) cb(buf)
    i++
  }
}
function skipFirstBlock(cb) {
  var i = 0
  return function(buf){
    if (i>0) cb(buf)
    i++
  }
}

function afterBlock(type, required, trim) {
  var buf = new TokenStringBuffer()
  var isInBlock = false
  buf.any(function (chunk) {
    if (chunk.type.match(/^end:/)
      && chunk.type.match(type)) {
      buf.startBuffer()
      isInBlock = true
    }

    if (!isInBlock) {
      buf.flush()
    }

    if (isInBlock) {
      var text = buf.filterType(/text/)
      if (text.length()>required.length) {
        if (text.toString()!==required) {
          var anchor = buf.shift()
          if (trim) {
            var toDelete = []
            var enough = false
            buf.forEach(function(c, i){
              if (c.type.match(/text/)) {
                if (!enough ) {
                  if (trim && c.str.match(trim)) {
                    toDelete.push(i)
                  } else {
                    enough = true
                  }
                }
              }
            })
            toDelete.reverse().forEach(function(index){
              buf.splice(index, 1)
            })
          }
          required.split('').forEach(function(c){
            buf.prepend({type:'text', str: c})
          })
          buf.prepend(anchor)
        }
        isInBlock = false
        buf.stopBuffer()
        buf.flush()
      }
    }
  })
  return buf.stream
}

