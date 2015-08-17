
var through2 = require('through2')
var TokenString = require('./token-string.js')

module.exports = function(then){
  return function(buf){


    var token = buf.first();
    var head = buf.lessType(token.type)
    head.concat(buf.lessType('token:'+token.type.split(':')[1]))

    var foot = buf.tailType(buf.last().type)
    foot = buf.tailType('token:'+token.type.split(':')[1]).concat(foot)

    var body = buf.splice(0)

    if(then) then(body)

    buf
      .concat(head)
      .concat(body)
      .concat(foot)

  }
}
