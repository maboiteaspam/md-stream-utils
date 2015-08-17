
function TokenString(){

  var that = this

  var thisTokenIndex = 0
  this.tokens = []
  this.str = ''

  var finalizeToken = function (token) {
    !('str' in token) && (token.str = '');
    !('type' in token) && (token.type = '');
  }

  this.toString = function (){
    return this.str
  }

  this.append = function (chunk){
    finalizeToken(chunk)
    this.str += chunk.str
    this.tokens.push(chunk)
    return this
  }
  this.appendStr = function (strChunk, type){
    var that = this
    that.append({type: type || 'text', str: strChunk})
    return this
  }
  this.prepend = function (chunk){
    finalizeToken(chunk)
    this.str = chunk.str + this.str
    this.tokens.unshift(chunk)
    return this
  }
  this.prependStr = function (strChunk, type){
    var that = this
    that.prepend({type: type || 'text', str: strChunk})
    return this
  }

  this.match = function (content){
    return this.str.match(content)
  }
  this.strLength = function (){
    return this.str.length
  }
  this.substr = function (){
    return this.str.substr.apply(this.str, arguments)
  }

  this.shift = function (){
    var chunk = this.tokens.shift()
    if (chunk) {
      this.str = this.str.substr(chunk.str.length)
    }
    return chunk
  }
  this.pop = function (){
    var chunk = this.tokens.pop()
    if (chunk) {
      this.str = this.str.substr(0, this.str.length-chunk.str.length)
    }
    return chunk
  }
  this.insert = function (i, token){
    finalizeToken(token)
    this.splice(i, 0, token);
    return this
  }
  this.indexOfType = function (type){
    var i = -1
    this.forEach(function(c, e){
      if (i===-1 && c.type===type) {
        i = e
      }
    })
    return i
  }
  this.lastIndexOfType = function (type){
    var i = -1
    this.forEachReversed(function(c, e){
      if (i===-1 && c.type===type) {
        i = e
      }
    })
    return i
  }
  this.indexOf = function (str){
    var i = -1
    this.forEach(function(c, e){
      if (i===-1 && c.str===str) {
        i = e
      }
    })
    return i
  }
  this.lastIndexOf = function (str){
    var i = -1
    this.forEachReversed(function(c, e){
      if (i===-1 && c.str===str) {
        i = e
      }
    })
    return i
  }

  this.slice = function (){
    var args = [].slice.call(arguments);
    var sub = new TokenString()
    sub.concat([].slice.apply(this.tokens, args))
    // this won t detect white nodes
    // can read count of white nodes in `sub`
    // to re splice again of that amount of nodes.

    this.updateChanges__()

    return sub
  }
  this.splice = function (){
    var args = [].slice.call(arguments);
    var sub = new TokenString()
    sub.concat([].splice.apply(this.tokens, args))
    // this won t detect white nodes
    // can read count of white nodes in `sub`
    // to re splice again of that amount of nodes.

    this.updateChanges__()

    return sub
  }
  this.split = function (by){
    var buffers = []
    var e = 0
    this.forEach(function(c, i){
      if (c.str.match(by)) {
        var x = that.slice(e, i+1)
        if (x.length()) buffers.push (x)
        e = i+1
      }
    })
    var x = that.slice(e, that.length())
    if (x.length()) buffers.push (x)
    return buffers
  }
  this.concat = function (buf){
    var that = this
    buf.forEach(function (chunk) {
      that.append(chunk)
    })
    return this
  }

  this.reverse = function (){
    this.tokens.reverse()
    this.updateChanges__()
    return this
  }
  this.filterType = function (t){
    var sub = new TokenString()
    this.forEach(function(c, i){
      if (c.type && c.type.match(t)) {
        sub.tokens.push(that.tokens[i])
      }
    })
    sub.updateChanges__()
    return sub
  }
  this.filterNotType = function (t){
    var sub = new TokenString()
    this.forEach(function(c, i){
      if (c.type && !c.type.match(t)) {
        sub.tokens.push(that.tokens[i])
      }
    })
    sub.updateChanges__()
    return sub
  }
  this.filterStr = function (t){
    var sub = new TokenString()
    this.forEach(function(c, i){
      var s = c.str || ''
      if (s.match(t)) {
        sub.tokens.push(that.tokens[i])
      }
    })
    sub.updateChanges__()
    return sub
  }
  this.getLastToken = function (type){
    for( var i=this.tokens.length-1;i>=0;i--) {
      if (this.tokens[i].type.match(type)) {
        return this.tokens[i]
      }
    }
    return null
  }
  this.first = function (){
    if (this.tokens.length) {
      return this.tokens[0]
    }
    return null
  }
  this.last = function (){
    if (this.tokens.length) {
      return this.tokens[this.tokens.length-1]
    }
    return null
  }

  this.less = function (some){
    var k = false;
    var stop = false;
    this.forEach(function(c, i){
      if (stop===false) {
        if (c.str.match(some)) {
          k = i+1
        } else {
          stop = true
        }
      }
    })
    return k===false?new TokenString : this.splice(0, k)
  }
  this.tail = function (some){
    var k = false;
    var stop = false;
    this.forEachReversed(function(c, i){
      if (stop===false) {
        if (c.str.match(some)) {
          k = i
        } else {
          stop = true
        }
      }
    })
    return k===false?new TokenString : this.splice(k)
  }
  this.lessLength = function (l){
    return this.splice(0, l)
  }
  this.tailLength = function (l){
    return this.splice(this.length()-l)
  }
  this.lessUntil = function (some){
    var k = false;
    var stop = false;
    this.forEach(function(c, i){
      if (!stop) {
        k=i+1
        if (c.str.match(some)) {
          stop = true
          k--
        }
      }
    })
    return k===false?new TokenString : this.splice(0, k)
  }
  this.tailUntil = function (some){
    var k = false;
    this.forEachReversed(function(c, i){
      if (k===false && c.str.match(some)) {
        k = i+1
      }
    })
    return k===false?this.splice(0) : this.splice(k)
  }
  this.lessType = function (some){
    var k = false;
    var stop = false;
    this.forEach(function(c, i){
      if (stop===false) {
        if (c.type.match(some)) {
          k = i+1
        } else {
          stop = true
        }
      }
    })
    return k===false?new TokenString : this.splice(0, k)
  }
  this.tailType = function (some){
    var k = false;
    var stop = false;
    this.forEachReversed(function(c, i){
      if (stop===false) {
        if (c.type.match(some)) {
          k = i
        } else {
          stop = true
        }
      }
    })
    return k===false?new TokenString : this.splice(k)
  }
  this.lessUntilType = function (some){
    var k = false;
    var stop = false;
    this.forEach(function(c, i){
      if (!stop) {
        k=i+1
        if (c.type.match(some)) {
          stop = true
          k--
        }
      }
    })
    return k===false?new TokenString : this.splice(0, k)
  }
  this.tailUntilType = function (some){
    var k = false;
    this.forEachReversed(function(c, i){
      if (k===false && c.type.match(some)) {
        k = i+1
      }
    })
    return k===false?this.splice(0) : this.splice(k)
  }


  this.sliceStr = function (f ,t){
    var sub = new TokenString()
    var sub2 = this.slice(f, t)
    sub.concat(sub2)
    while (sub2.filterStr(/^$/).length()) {
      sub2 = this.slice(f+sub.length(), sub2.filterStr(/^$/).length())
      sub.concat(sub2)
    }
    this.updateChanges__()
    return sub
  }
  this.spliceStr = function (f, t){
    t=t===undefined?this.length():t
    var sub = new TokenString()
    var sub2 = this.splice(f, t)
    sub.concat(sub2)
    while (sub2.filterStr(/^$/).length()) {
      sub2 = this.splice(0, sub2.filterStr(/^$/).length())
      sub.concat(sub2)
    }
    this.updateChanges__()
    return sub
  }

  this.lessMatch = function (some){
    var k = false;
    var stop = false;
    var str = ''
    this.forEach(function(c, i){
      str += c.str
      if (stop===false) {
        var m = str.match(some)
        if (m && m.length>0 && m.index===0) {
          k = i+1
          stop = true
        } else {
        }
      }
    })
    return k===false?new TokenString : this.spliceStr(0, k)
  }
  this.lessUntilMatch = function (some){
    var k = false;
    var stop = false;
    var str = ''
    this.forEach(function(c, i){
      str += c.str
      if (stop===false) {
        var m = str.match(some)
        if (m && m.length>0) {
          k = m.index
          stop = true
        } else {
        }
      }
    })
    return k===false?new TokenString : this.spliceStr(0, k)
  }
  this.tailMatch = function (some){
    var k = false;
    var stop = false;
    var str = ''
    this.forEachReversed(function(c, i){
      str += c.str
      if (stop===false) {
        var m = str.match(some)
        if (m && m.length>0 && m.index===0) {
          k = that.length()-m[0].length
          stop = true
        } else {
        }
      }
    })
    return k===false?new TokenString : this.spliceStr(k)
  }
  this.tailUntilMatch = function (some){
    var k = false;
    var stop = false;
    var str = ''
    this.forEachReversed(function(c, i){
      str += c.str
      if (stop===false) {
        var m = str.match(some)
        if (m && m.length>0) {
          k = that.length()- m.index
          stop = true
        } else {
        }
      }
    })
    return k===false?new TokenString : this.spliceStr(k)
  }


  this.forEach = function (then){
    if (then) {
      var it = [].concat(this.tokens)
      for(var i=0;i<it.length;i++) {
        then(it[i], i)
      }
    }
    return this
  }
  this.forEachReversed = function (then){
    if (then) {
      var it = [].concat(this.tokens)
      for(var i=it.length-1;i>=0;i--) {
        then(it[i], i)
      }
    }
    return this
  }
  this.length = function (){
    return this.tokens.length
  }

  this.clear = function (){
    this.tokens = []
    this.str = ''
    return this
  }


  this.updateChanges__ = function (){
    var s = ''
    this.tokens.forEach(function(c){
      s += c.str || ''
    })
    this.str = s
  }
}

module.exports = TokenString
