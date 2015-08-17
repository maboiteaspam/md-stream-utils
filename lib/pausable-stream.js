
var through2 = require('through2')
var _ = require('underscore')
var TokenString = require('./token-string.js')


function PausableStream(){
  var that = this
  that.resumer = null;
  that.isPaused = false;
  that.keepPump = null;
  that.stream = through2.obj(function(chunk, enc, callback){

    var pause = that.isPaused
    if (!pause && that.keepPump) {
      pause = that.keepPump(chunk)
    }

    if (pause) {
      that.resumer = function(pushOnly){
        that.stream.push(chunk, enc)
        if (!pushOnly) callback()
      }
      that.keepPump = null
    } else {
      that.stream.push(chunk, enc)
      callback()
    }
  }, function(callback){
    if (that.resumer) {
      that.resumer(true)
    }
    that.resumer = null
    callback()
  })

  that.pause = function(){
    that.isPaused = true
  }
  that.resume = function(){
    that.isPaused = false
    if (that.resumer) {
      that.resumer()
    }
  }
  that.pumpUntil = function(fn){
    that.keepPump = fn
    return that
  }
}

module.exports = PausableStream
