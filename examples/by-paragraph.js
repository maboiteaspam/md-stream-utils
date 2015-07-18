
var mdUtils = require('../index.js')

process.stdin
  .pipe(mdUtils.tokenizer())
  .pipe(mdUtils.byParapgraph())
  .pipe(mdUtils.cliColorize())
  .pipe(mdUtils.toString({append: '--'}))
  .pipe(process.stdout)
