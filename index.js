var mdTok = require("md-tokenizer");
module.exports = {
  tokenizer: function(){
    return mdTok();
  },
  byLine: require("./lib/by-line"),
  byBlock: require("./lib/by-block"),
  byParapgraph: require("./lib/by-paragraph"),
  cliColorize: require("./lib/cli-colorize"),
  toString: require("./lib/to-string"),
  flatten: require("./lib/flatten"),
  filter: require("./lib/filter")
}
