
var mdUtils = require('../index.js')

process.stdin
  .pipe(mdUtils.tokenizer())
  .pipe(mdUtils.cliColorize())
  .pipe(mdUtils.toString())
  .pipe(process.stdout)
