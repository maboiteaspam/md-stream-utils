
var mdUtils = require('../index.js')

process.stdin
  .pipe(mdUtils.tokenizer())
  .pipe(mdUtils.byParapgraph())
  .pipe(mdUtils.flatten())
  .pipe(mdUtils.toString())
  .pipe(process.stdout)
