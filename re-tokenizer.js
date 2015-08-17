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
  .pipe(mds.tokenize())
  .pipe(mds.format())
  .pipe(mds.colorize())
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

