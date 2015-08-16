
var resumer = require('resumer')
var multiline = require('multiline')

/**
 * Helper to produce test and samples
 * @param fn
 * @param append
 * @returns {*|number}
 */
function multilineToStream(fn, append){
  var str = multiline.stripIndent(fn) + (append||'')
  return resumer().queue(str).end()
}

function getCallerLocation () {
  var path = require('path')
  var stack = new Error().stack.split('\n');
  stack.shift();stack.shift();stack.shift();
  var caller = stack.shift()
  if (!caller || !caller.length) {

    console.error('please report')
    console.error(new Error().stack)

    throw 'that is so weird.'
  }

  return caller;
}

module.exports = {
  multilineToStream: multilineToStream,
  getCallerLocation: getCallerLocation
}