var mdTok = require("md-tokenizer");
module.exports = {
  tokenizer: function(){
    return mdTok();
  },
  byLine: require("./lib/by-line"),
  byBlock: require("./lib/by-block"),
  byParapgraph: require("./lib/by-paragraph"),
  cliColorize: require("./lib/cli-colorize"),
  flatten: require("./lib/flatten"),
  filter: require("./lib/filter"),
  less: require("./lib/less"),
  toString: require("./lib/to-string"),
  toJSON: require("./lib/to-json")
}
