
var through2 = require('through2')

var mds = {
  applyLineBlock: require('./lib/apply-line-block'),
  applyTagBlock: require('./lib/apply-tag-block'),
  byLine: require('./lib/by-line'),
  byWord: require('./lib/by-word'),
  cleanBlock: require('./lib/clean-block'),
  colorizeContent: require('./lib/colorize-content'),
  colorizeToken: require('./lib/colorize-token'),
  controlLength: require('./lib/control-length'),
  extractBlock: require('./lib/extract-block'),
  extractBlockWithWhitespace: require('./lib/extract-block-with-whitespace'),
  fence: require('./lib/fence'),
  flattenToJson: require('./lib/flatten-to-json'),
  flattenToString: require('./lib/flatten-to-string'),
  getBlockContent: require('./lib/get-block-content'),
  hideToken: require('./lib/hide-token'),
  less: require('./lib/less'),
  maxLength: require('./lib/max-length'),
  normalizeFrontspace: require('./lib/normalize-frontspace'),
  RegExp: require('./lib/regexp-quote'),
  PausableStream: require('./lib/pausable-stream'),
  regroupListItemsLines: require('./lib/regroup-list-items-lines'),
  removeFrontspace: require('./lib/remove-frontspace'),
  removeToken: require('./lib/remove-token'),
  resolveColors: require('./lib/resolve-colors'),
  revealMarkup: require('./lib/reveal-markup'),
  revealToken: require('./lib/reveal-token'),
  surroundBlock: require('./lib/surround-block'),
  surroundBlockContent: require('./lib/surround-block-content'),
  TokenString: require('./lib/token-string'),
  toTokenString: require('./lib/to-token-string'),
  trimBlock: require('./lib/trim-block'),
  utils: require('./lib/utils'),
  whenBlock: require('./lib/when-block'),

  tokenize: null,
  colorize: null
}

mds.tokenize = function () {
  var tokenizerStream = through2.obj();
  var tok2 = tokenizerStream
    .pipe(mds.byLine())
    .pipe(mds.applyLineBlock('heading', /^\s*(#{1,6})/i))
    .pipe(mds.applyLineBlock('listitem', /^\s*([\-+*]\s)/i))
    .pipe(mds.applyLineBlock('listitem', /^\s*([0-9]+\.\s)/i))
    .pipe(mds.regroupListItemsLines())
    .pipe(mds.applyLineBlock('linecodeblock', /^([ ]{4})/i))
    .pipe(mds.applyTagBlock('codeblock', /[`]{3}/, true))
    .pipe(mds.applyTagBlock('inlinecode', /[`]{1}/))
    .pipe(mds.applyTagBlock('emphasis', /[~]{2}/))
    .pipe(mds.applyTagBlock('emphasis', /[~]{1}/))
    .pipe(mds.applyTagBlock('emphasis', /[~]{2}/))
    .pipe(mds.applyTagBlock('emphasis', /[*]{2}/))
    .pipe(mds.applyTagBlock('emphasis', /[*]{1}/))
    .pipe(mds.applyTagBlock('emphasis', /[_]{2}/))
    .pipe(mds.applyTagBlock('emphasis', /[_]{1}/))

    .pipe(mds.extractBlock('codeblock', mds.cleanBlock()))
    .pipe(mds.extractBlock('inlinecode', mds.cleanBlock()))
    .pipe(mds.extractBlock('linecodeblock', mds.cleanBlock('')));

  var i = 0
  return through2.obj(function (c,_,cb) {
    tokenizerStream.write(c);
    var that = this
    if (!i) {
      tok2.on('data', function (c) {
        that.push(c)
      })
    }
    i++
    cb()
  });
}

mds.format = function () {
  var tokenizerStream = through2.obj();
  var tok2 = tokenizerStream
      .pipe(mds.extractBlock('heading', mds.getBlockContent(mds.removeFrontspace())))
      .pipe(mds.extractBlock(/listitem/, mds.getBlockContent(mds.removeFrontspace())))
      .pipe(mds.extractBlock('codeblock', mds.normalizeFrontspace()))
      .pipe(mds.extractBlock('codeblock', mds.getBlockContent(mds.fence(function () {return [4,0]}))))
      .pipe(mds.extractBlock(/listitem/, function(buf) {
          var t = buf.first().tokenStr.length;
          buf.prependStr(' ')
          mds.getBlockContent(mds.fence(function () {return [t+1, 0]}))(buf)
        }
      ))
      .pipe(mds.removeToken('heading', /.+/))
      .pipe(mds.removeToken('codeblock', /.+/))
      .pipe(mds.removeToken('inlinecode', /.+/))
      .pipe(mds.removeToken('emphasis', /.+/))
    ;

  var i = 0
  return through2.obj(function (c,_,cb) {
    tokenizerStream.write(c);
    var that = this
    if (!i) {
      tok2.on('data', function (c) {
        that.push(c)
      })
    }
    i++
    cb()
  });
}

var chalk = require('chalk')
mds.colorize = function () {
  var tokenizerStream = through2.obj();
  var tok2 = tokenizerStream
      .pipe(mds.extractBlock('linecodeblock', mds.colorizeContent(chalk.white.italic)))
      .pipe(mds.extractBlock('inlinecode', mds.colorizeContent(chalk.white.italic)))
      .pipe(mds.extractBlock('codeblock', mds.colorizeContent(chalk.white.italic)))
      .pipe(mds.extractBlock('emphasis', /_/, mds.colorizeContent(chalk.bold)))
      .pipe(mds.extractBlock('emphasis', /\*/, mds.colorizeContent(chalk.bold)))
      .pipe(mds.extractBlock('emphasis', /~/, mds.colorizeContent(chalk.strikethrough)))
      .pipe(mds.extractBlock('listitem', mds.colorizeToken(chalk.magenta.bold)))
      .pipe(mds.extractBlock('heading', mds.colorizeContent(chalk.bold.underline.cyan)))
    ;

  var i = 0
  return through2.obj(function (c,_,cb) {
    tokenizerStream.write(c);
    var that = this
    if (!i) {
      tok2.on('data', function (c) {
        that.push(c)
      })
    }
    i++
    cb()
  });
}

module.exports = mds;
