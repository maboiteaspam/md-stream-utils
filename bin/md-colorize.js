#!/usr/bin/env node

var through2 = require("through2")
var fs = require('fs')
var mds = require('../index.js')
var argv = require('minimist')(process.argv.slice(2));

var input = argv._.length > 0 ? fs.createReadStream(argv._[0]) : process.stdin;
var output = argv._.length > 1 ? fs.createWriteStream(argv._[1]) : process.stdout;

var pumpable = new mds.PausableStream()
pumpable.pause()
input
  .pipe(mds.toTokenString())
  .pipe(argv._.length > 0 ? pumpable.stream : through2.obj())
  .pipe(mds.tokenize())
  .pipe(mds.format())
  .pipe(mds.colorize())
  .pipe(argv._.length > 0 ? mds.less(pumpable) : through2.obj())
  .pipe(mds.flattenToString(mds.resolveColors.transform))
  .pipe(output)

