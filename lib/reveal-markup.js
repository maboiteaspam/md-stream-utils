
var through2 = require('through2')

/**
 * Identifies all start/end tokens
 * matching the given tag.
 * And inserts text nodes
 * to visualize markups.
 *
 * @returns {*}
 */
function revealMarkup(tag) {
  return through2.obj(function(chunk, enc, callback){
    var toInsert = []
    chunk.forEach(function(c, i){
      if (c.type
        && c.type.match(/^(start|end)/)
        && c.type.match(tag)) {
        var str = '' + c.type
        if (c.type.match(/^(start)/)){
          str+='['+c.power+']'+'::'
        } else {
          str='::'+str
        }
        toInsert.push([i+1, {type:'text', str:str}])
      }
    })
    toInsert.forEach(function(p){
      chunk.insert(p[0], p[1])
    })
    this.push(chunk, enc)
    callback()
  })
}

module.exports = revealMarkup
