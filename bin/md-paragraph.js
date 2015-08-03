#!/usr/bin/env node

var through2 = require("through2")
var fs = require('fs')
var mdUtils = require('../index.js')
var argv = require('minimist')(process.argv.slice(2));

var input = argv._.length > 0 ? fs.createReadStream(argv._[0]) : process.stdin;
var output = argv._.length > 1 ? fs.createWriteStream(argv._[1]) : process.stdout;
var content = argv.c || argv.content || null;
var format = argv.f || argv.format || null;

var d = '';
input.pipe(mdUtils.tokenizer())
  .pipe(mdUtils.byParapgraph())
  .pipe(content ? mdUtils.filter({content: content}) : through2.obj())
  .pipe(mdUtils.flatten())
  .pipe(format==='json'
    ? mdUtils.toJSON({append: ''})
    : mdUtils.toString({properEnding: true}) )
  .pipe(output);
