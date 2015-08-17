#!/usr/bin/env node

var through2 = require('through2')
var fs = require('fs')
var mds = require('../index.js')
var argv = require('minimist')(process.argv.slice(2));

var input = argv._.length > 0 ? fs.createReadStream(argv._[0]) : process.stdin;
var output = argv._.length > 1 ? fs.createWriteStream(argv._[1]) : process.stdout;
var content = argv.c || argv.content || null;

var d = '';
input
  .pipe(mds.toTokenString())
  .pipe(mds.tokenize())
  .pipe(mds.byParagraph())
  .pipe((function (){
    var hasFoundH = false
    var hasFoundP = false
    return through2.obj(function(c,_,cb){
      if (!hasFoundH
        && c.length()
        && c.first().type.match(/heading/)
        && c.match(content)) {
        hasFoundH = true
        this.push(c)
      } else if (hasFoundH && !hasFoundP) {
        hasFoundP = true
        this.push(c)
      }
      cb()
    })
  })())
  .pipe(mds.format())
  .pipe(mds.colorize())
  .pipe(mds.flattenToString(mds.resolveColors.transform))
  .on('data', function(data){
    if (data) {
      d = '' + data
    }
  })
  .on('end', function(){
    if (!d.match(/\n$/) && !argv._.length) {
      output.write('\n')
    }
  })
  .pipe(output);
