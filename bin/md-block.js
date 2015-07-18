#!/usr/bin/env node

var through2 = require("through2")
var fs = require('fs')
var mdUtils = require('../index.js')
var argv = require('minimist')(process.argv.slice(2));

var input = argv._.length > 0 ? fs.createReadStream(argv._[0]) : process.stdin;
var output = argv._.length > 1 ? fs.createWriteStream(argv._[1]) : process.stdout;
var type = argv.t || argv.type || null;
var content = argv.c || argv.content || null;

var d = '';
input
  .pipe(mdUtils.tokenizer())
  .pipe(mdUtils.byBlock())
  .pipe(content || type ? mdUtils.filter({type: type, content: content}) : through2.obj())
  .pipe(mdUtils.toString())
  .on('data', function(data){
    if (data) {
      d = '' + data
    }
  })
  .on('end', function(){
    if (!d.match(/\n$/)) {
      output.write('\n')
    }
  })
  .pipe(output)
