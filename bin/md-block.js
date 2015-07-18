#!/usr/bin/env node

var through2 = require("through2")
var byline = require('byline')
var fs = require('fs')
var mdUtils = require('../index.js')
var argv = require('minimist')(process.argv.slice(2));

var input = argv._.length > 0 ? fs.createReadStream(argv._[0]) : process.stdin;
var output = argv._.length > 1 ? fs.createWriteStream(argv._[1]) : process.stdout;
var type = argv.t || argv.type || null;
var content = argv.c || argv.content || null;

input
  .pipe(mdUtils.tokenizer())
  .pipe(mdUtils.byBlock())
  .pipe(content || type ? mdUtils.filter({type: type, content: content}) : through2.obj())
  .pipe(mdUtils.cliColorize())
  .pipe(output)

input.on('end', function(){
  output.write('\n')
})
