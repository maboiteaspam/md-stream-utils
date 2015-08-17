

function filter(how) {
  return function (buf) {
    var pass = true
    if (how.type && !buf.first().type.match(how.type) ) {
      pass = false
    }
    if (how.content && !buf.match(how.content)) {
      pass = false
    }
    if (!pass) {
      buf.splice(0)
    }
  }
}

module.exports = filter
