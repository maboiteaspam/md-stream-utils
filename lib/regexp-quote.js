
var _ = require('underscore')

RegExp.quote = require('regexp-quote')
RegExp.fromStr = function (str, flags){
  if (_.isString(str)) {
    return new RegExp(RegExp.quote(str), flags)
  }
  return str
}

module.exports = RegExp
