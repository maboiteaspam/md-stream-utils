#!/usr/bin/env node

var through2 = require("through2")
var fs = require('fs')
var mdUtils = require('../index.js')
var argv = require('minimist')(process.argv.slice(2));

var input = argv._.length > 0 ? fs.createReadStream(argv._[0]) : process.stdin;
var output = argv._.length > 1 ? fs.createWriteStream(argv._[1]) : process.stdout;
var format = argv.f || argv.format || null;

var d = '';
input
  .pipe(mdUtils.tokenizer())
  .pipe(mdUtils.cliColorize())
  .pipe(mdUtils.byLine())
  .pipe(mdUtils.less())
  .pipe(mdUtils.toString({properEnding: true}))
  .pipe(output)
