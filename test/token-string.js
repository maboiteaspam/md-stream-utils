
require('should')

var TokenString = require('../lib/token-string.js')

describe('TokenString.toString', function () {
  it('can render a proper string', function () {
    var t = new TokenString()
    t.append({type:'text', str:'some'})
    t.append({type:'text', str:'-'})
    t.toString().should.eql('some-')
  })
})

describe('TokenString.append', function () {

  it('can add a token to the end', function () {
    var t = new TokenString()
    t.append({type:'text', str:'some'})
    t.toString().should.eql('some')
    t.splice(0).tokens.should.eql([{type:'text', str:'some'}])
  })

  it('can ensure the token is finalized', function () {
    var t = new TokenString()
    t.append({})
    t.first().should.eql({type:'', str:''})
  })
})

describe('TokenString.appendStr', function () {

  it('can add a str as a new token to the end', function () {
    var t = new TokenString()
    t.appendStr('some')
    t.toString().should.eql('some')
    t.splice(0).tokens.should.eql([{type:'text', str:'some'}])
  })
})

describe('TokenString.prepend', function () {

  it('can add a token to the begin', function () {
    var t = new TokenString()
    t.append({type:'text', str:'some'})
    t.prepend({type:'text', str:'-'})
    t.toString().should.eql('-some')
    t.splice(0).tokens.should.eql([{type:'text', str:'-'},{type:'text', str:'some'}])
  })

  it('can ensure the token is finalized', function () {
    var t = new TokenString()
    t.prepend({})
    t.first().should.eql({type:'', str:''})
  })
})

describe('TokenString.prependStr', function () {

  it('can add a str as a new token to the begin', function () {
    var t = new TokenString()
    t.prependStr('')
    t.prependStr('some')
    t.appendStr('')
    t.toString().should.eql('some')
    t.splice(0).first().should.eql({type:'text', str:'some'})
  })
})

describe('TokenString.match', function () {

  it('can match the underlying string with a regexp', function () {
    var t = new TokenString()
    t.prependStr('')
    t.prependStr('some text ')
    t.appendStr('')
    t.match(/\s\w+/)[0].should.eql(' text')
  })
})

describe('TokenString.strLength', function () {

  it('can provide the length of the underlying string', function () {
    var t = new TokenString()
    t.prependStr('')
    t.prependStr('some text ')
    t.appendStr('')
    t.strLength().should.eql('some text '.length)
  })
})

describe('TokenString.length', function () {

  it('can provide the length of the underlying string', function () {
    var t = new TokenString()
    t.prependStr('')
    t.prependStr('some text ')
    t.appendStr('')
    t.length().should.eql(3)
  })
})

describe('TokenString.substr', function () {

  it('can provide the length of the underlying string', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.strLength().should.eql('some text '.length)
    t.tokens.should.eql([{type:'text', str:'some text '},{type:'text', str:''}])
  })
})

describe('TokenString.shift', function () {

  it('can remove the first element of the string', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.shift().should.eql({type:'text', str:'some text '})
    t.tokens.should.eql([{type:'text', str:''}])
  })

  it('can update the underlying string', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.shift().should.eql({type:'text', str:'some text '})
    t.toString().should.eql('')
  })
})

describe('TokenString.pop', function () {

  it('can remove the last element of the string', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.pop().should.eql({type:'text', str:''})
    t.tokens.should.eql([{type:'text', str:'some text '}])
  })

  it('can update the underlying string', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.pop().should.eql({type:'text', str:''})
    t.toString().should.eql('some text ')
  })
})

describe('TokenString.insert', function () {

  it('can insert a new element at given position', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.insert(0,{type:'text', str:'get '}).first().should.eql({type:'text', str:'get '})
  })

  it('can insert a new element at any given position', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.insert(1, {type:'text', str:'get '}).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'get '},
      {type:'text', str:''}
    ])
  })

  it('can insert a new element at the end when given position exceeds the length', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.insert(9, {type:'text', str:'get '}).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:''},
      {type:'text', str:'get '}
    ])
  })

  it('can update the underlying string', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.insert(0,{type:'text', str:'get '}).toString().should.eql('get some text ')
  })
})

describe('TokenString.indexOfType', function () {

  it('can find index of a node with given type', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('')
    t.indexOfType('token:whatever').should.eql(1)
    t.indexOfType('text').should.eql(0)
  })

  it('can find index of the first node with given type', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.append({type:'token:whatever'})
    t.append({type:'token:whatever'})
    t.appendStr('')
    t.indexOfType('token:whatever').should.eql(2)
    t.indexOfType('text').should.eql(0)
  })

  it('can returns -1 if the search failed', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.append({type:'token:whatever'})
    t.append({type:'token:whatever'})
    t.appendStr('')
    t.indexOfType('token:no').should.eql(-1)
    t.indexOfType('text').should.eql(0)
  })
})

describe('TokenString.lastIndexOfType', function () {

  it('can find index of the last node with given type', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.append({type:'token:whatever'})
    t.appendStr('')
    t.lastIndexOfType('token:whatever').should.eql(2)
    t.lastIndexOfType('text').should.eql(3)
  })

  it('can returns -1 if the search failed', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.append({type:'token:whatever'})
    t.append({type:'token:whatever'})
    t.appendStr('')
    t.lastIndexOfType('token:no').should.eql(-1)
    t.lastIndexOfType('text').should.eql(4)
  })
})

describe('TokenString.indexOf', function () {

  it('can find index of a token with its given str', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.indexOf('--').should.eql(2)
    t.indexOf('some text ').should.eql(0)
  })

  it('can find index of the first token occurrence with its given str', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.append({type:'token:whatever'})
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.indexOf('--').should.eql(4)
    t.indexOf('some text ').should.eql(0)
  })

  it('can returns -1 if the search failed', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.append({type:'token:whatever'})
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.indexOf('g').should.eql(-1)
  })
})

describe('TokenString.lastIndexOf', function () {

  it('can find index of the last token occurrence with its given str', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('--')
    t.append({type:'token:whatever'})
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.lastIndexOf('--').should.eql(4)
    t.lastIndexOf('some text ').should.eql(0)
  })

  it('can returns -1 if the search failed', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('')
    t.append({type:'token:whatever'})
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.lastIndexOf('g').should.eql(-1)
  })
})

describe('TokenString.slice', function () {

  it('can slice a portion of tokens', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.slice(1,2).tokens.should.eql([{type:'token:whatever', str:''}])
    t.slice(1,2).toString().should.eql('')
    t.toString().should.eql('some text ----')
  })

  it('does not change original tokens', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.slice(1,2).tokens.should.eql([{type:'token:whatever', str:''}])
    t.tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.slice(1,2).toString().should.eql('')
    t.toString().should.eql('some text ----')
  })

  it('can handle weird indices', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.slice(-10,20).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.toString().should.eql('some text ----')
  })
})

describe('TokenString.splice', function () {

  it('can splice a portion of tokens', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.splice(2,1).tokens.should.eql([{type:'text', str:'--'}])
    t.toString().should.eql('some text --')
  })

  it('does change original tokens', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    var originalLength = t.length()
    var originalStrLength = t.strLength()
    t.splice(2,1).tokens.should.eql([{type:'text', str:'--'}])
    t.length().should.not.eql(originalLength)
    t.strLength().should.not.eql(originalStrLength)
    t.length().should.eql(3)
    t.strLength().should.eql('some text '.length+2)
  })

  it('can handle weird indices', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.splice(-10,20).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.tokens.should.eql([])
  })
})

describe('TokenString.split', function () {

  it('can split a tokens in many portions', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.split('')[0].tokens.should.eql([{type:'text', str:'some text '}])
    t.split('')[0].toString().should.eql('some text ')

    t.split('')[1].tokens.should.eql([{type:'token:whatever', str:''}])
    t.split('')[1].toString().should.eql('')

    t.split('')[2].tokens.should.eql([{type:'text', str:'--'}])
    t.split('')[2].toString().should.eql('--')

    t.split('')[3].tokens.should.eql([{type:'text', str:'--'}])
    t.split('')[3].toString().should.eql('--')
  })

  it('can split a tokens in many portions', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.appendStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--\n')

    t.split(/\s/)[0].tokens.should.eql([{type:'text', str:'some text '}])
    t.split(/\s/)[1].tokens.should.eql([
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'},
      {type:'text', str:'some text '}
    ])
    t.split(/\s/)[2].tokens.should.eql([
      {type:'token:whatever', str:''},
      {type:'text', str:'--\n'}
    ])
  })
})

describe('TokenString.concat', function () {

  it('can concat a token to another one', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    var t2 = new TokenString()
    t2.concat(t)

    t2.tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t2.toString().should.eql('some text ----')
  })
  it('does not change concat-ened token', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    var t2 = new TokenString()
    t2.concat(t)

    t.tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.toString().should.eql('some text ----')
  })
})

describe('TokenString.reverse', function () {

  it('can reverse a token to another one', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.reverse().tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'},
      {type:'token:whatever', str:''},
      {type:'text', str:'some text '}
    ])
    t.toString().should.eql('----some text ')
  })

  it('can update underlying string', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.reverse().toString().should.eql('----some text ')
  })

  it('does change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.reverse()

    t.toString().should.eql('----some text ')
  })
})

describe('TokenString.filterType', function () {

  it('can filter tokens given a type', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.filterType(/token/).tokens.should.eql([
      {type:'token:whatever', str:''}
    ])
    t.filterType(/text/).toString().should.eql('some text ----')
  })

  it('does not change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.filterType(/token/)

    t.toString().should.eql('some text ----')
  })
})

describe('TokenString.filterNotType', function () {

  it('can filter tokens given a type', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.filterNotType(/text/).tokens.should.eql([
      {type:'token:whatever', str:''}
    ])
    t.filterNotType(/token/).toString().should.eql('some text ----')
  })

  it('does not change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.filterNotType(/token/)

    t.toString().should.eql('some text ----')
  })
})

describe('TokenString.filterStr', function () {

  it('can filter tokens given a str', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.filterStr(/^--$/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.filterStr(/some/).toString().should.eql('some text ')
  })

  it('can t find empty strings. It s little weird, to be checked.', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.filterStr(/^$/).tokens.should.eql([
    ])
  })

  it('does not change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.filterStr(/token/)

    t.filterStr(/some/).toString().should.eql('some text ')
  })
})

describe('TokenString.getLastToken', function () {

  it('can get the last token given its type', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.getLastToken(/.+/).should.eql({type:'text', str:'--'})
    t.getLastToken(/token/).should.eql({type:'token:whatever', str:''})
    t.getLastToken(/text/).should.eql({type:'text', str:'--'})
  })

  it('returns null when there is no such value', function () {
    var t = new TokenString();
    (t.getLastToken(/.+/)===null).should.eql(true)
  })
})

describe('TokenString.first', function () {

  it('can get the first token given its type', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.first().should.eql({type:'text', str:'some text '})
  })

  it('returns null when there is no such value', function () {
    var t = new TokenString();
    (t.first()===null).should.eql(true)
  })
})

describe('TokenString.last', function () {

  it('can get the last token given its type', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.last().should.eql({type:'text', str:'--'})
  })

  it('returns null when there is no such value', function () {
    var t = new TokenString();
    (t.last()===null).should.eql(true)
  })
})

describe('TokenString.less', function () {

  it('can retrieve starting nodes given their str pattern', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.less(/[a-z]/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
  })

  it('does change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.less(/[a-z]/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.tokens.should.eql([
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.less(/^$/).tokens.should.eql([
      {type:'token:whatever', str:''}
    ])
    t.less(/^$/).tokens.should.eql([])
    t.tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.less(/[\-]+/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.tokens.should.eql([])
  })

  it('returns empty TokenString when there is no such value', function () {
    var t = new TokenString();
    t.less(/.+/).tokens.should.eql([])

    t = new TokenString();
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.less(/nnnnn/).tokens.should.eql([])
  })
})

describe('TokenString.tail', function () {

  it('can retrieve ending nodes given their str pattern', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.tail(/[-]+/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })

  it('does change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.tail(/^$/).tokens.should.eql([])
    t.tail(/[-]+/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'},
      {type:'token:whatever', str:''}
    ])
    t.tail(/^$/).tokens.should.eql([
      {type:'token:whatever', str:''}
    ])
    t.tail(/^$/).tokens.should.eql([])
    t.tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.tail(/[a-z]+/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.tokens.should.eql([])
  })

  it('returns empty TokenString when there is no such value', function () {
    var t = new TokenString();
    t.tail(/.+/).tokens.should.eql([])

    t = new TokenString();
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.tail(/nnnnn/).tokens.should.eql([])
  })
})

describe('TokenString.lessLength', function () {

  it('can retrieve starting nodes given a length', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.lessLength(2).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
  })

  it('does change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.lessLength(0).tokens.should.eql([])
    t.lessLength(1).tokens.should.eql([{type:'text', str:'some text '}])
    t.lessLength(1).tokens.should.eql([{type:'text', str:'here and there'}])
    t.tokens.should.eql([
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })

  it('returns empty TokenString when there is no such value', function () {
    var t = new TokenString();
    t.lessLength(10).tokens.should.eql([])

    t = new TokenString();
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.lessLength(-1).tokens.should.eql([])
  })
})

describe('TokenString.tailLength', function () {

  it('can retrieve ending nodes given a length', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.tailLength(2).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })

  it('does change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.tailLength(0).tokens.should.eql([])
    t.tailLength(1).tokens.should.eql([{type:'text', str:'--'}])
    t.tailLength(1).tokens.should.eql([{type:'text', str:'--'}])
    t.tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'},
      {type:'token:whatever', str:''}
    ])
  })

  it('returns empty TokenString when there is no such value', function () {
    var t = new TokenString();
    t.tailLength(10).tokens.should.eql([])

    t = new TokenString();
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.tailLength(-1).tokens.should.eql([])
  })
})

describe('TokenString.lessUntil', function () {

  it('can retrieve starting nodes until given str pattern', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.lessUntil(/--/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'},
      {type:'token:whatever', str:''}
    ])
  })

  it('does change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.lessUntil(/\w/).tokens.should.eql([
    ])
    t.lessUntil(/\s/).tokens.should.eql([
    ])
    t.lessUntil(/^$/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.lessUntil(/^$/).tokens.should.eql([])
    t.lessUntil(/--/).tokens.should.eql([{type:'token:whatever', str:''}])
    t.lessUntil(/.+/).tokens.should.eql([])
    t.lessUntil(/\s/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.tokens.should.eql([])
  })

  it('returns empty TokenString when there is no such value', function () {
    var t = new TokenString();
    t.lessUntil(/.+/).tokens.should.eql([])

    t = new TokenString();
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.lessUntil(/gggg/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'},
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })
})

describe('TokenString.tailUntil', function () {

  it('can retrieve ending nodes until given str pattern', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.tailUntil(/--/).tokens.should.eql([])
    t.tailUntil(/\w/).tokens.should.eql([
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })

  it('does change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.tailUntil(/-/).tokens.should.eql([])
    t.tailUntil(/^$/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.tailUntil(/^$/).tokens.should.eql([])
    t.tailUntil(/\w/).tokens.should.eql([{type:'token:whatever', str:''}])
    t.tailUntil(/.+/).tokens.should.eql([])
    t.tailUntil(/ccccc/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.tokens.should.eql([])
  })

  it('returns empty TokenString when there is no such value', function () {
    var t = new TokenString();
    t.tailUntil(/.+/).tokens.should.eql([])

    t = new TokenString();
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.tailUntil(/gggg/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'},
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })
})

describe('TokenString.lessType', function () {

  it('can retrieve starting nodes given type pattern', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.lessType(/token/).tokens.should.eql([])
    t.lessType(/text/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.lessType(/token/).tokens.should.eql([
      {type:'token:whatever', str:''}
    ])
    t.lessType(/token/).tokens.should.eql([])
    t.lessType(/text/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })

  it('does change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.lessType(/text/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.tokens.should.eql([
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.lessType(/token/).tokens.should.eql([
      {type:'token:whatever', str:''}
    ])
    t.lessType(/token/).tokens.should.eql([])
    t.tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.lessType(/text/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.tokens.should.eql([])
  })

  it('returns empty TokenString when there is no such value', function () {
    var t = new TokenString();
    t.lessType(/.+/).tokens.should.eql([])

    t = new TokenString();
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.lessType(/nnnnn/).tokens.should.eql([])
  })
})

describe('TokenString.tailType', function () {

  it('can retrieve ending nodes given type pattern', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.tailType(/token/).tokens.should.eql([])
    t.tailType(/text/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })

  it('does change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.tailType(/token/).tokens.should.eql([])
    t.tailType(/text/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'},
      {type:'token:whatever', str:''}
    ])
    t.tailType(/token/).tokens.should.eql([
      {type:'token:whatever', str:''}
    ])
    t.tailType(/token/).tokens.should.eql([])
    t.tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.tailType(/text/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.tokens.should.eql([])
  })

  it('returns empty TokenString when there is no such value', function () {
    var t = new TokenString();
    t.tailType(/.+/).tokens.should.eql([])

    t = new TokenString();
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.tailType(/nnnnn/).tokens.should.eql([])
  })
})

describe('TokenString.lessUntilType', function () {

  it('can retrieve starting nodes until given type pattern', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.lessUntilType(/text/).tokens.should.eql([])
    t.lessUntilType(/token/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.lessUntilType(/token/).tokens.should.eql([])
    t.lessUntilType(/text/).tokens.should.eql([
      {type:'token:whatever', str:''}
    ])
    t.lessUntilType(/text/).tokens.should.eql([])
    t.lessUntilType(/token/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })

  it('does change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.lessUntilType(/text/).tokens.should.eql([])
    t.lessUntilType(/token/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.tokens.should.eql([
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.lessUntilType(/token/).tokens.should.eql([])
    t.lessUntilType(/text/).tokens.should.eql([
      {type:'token:whatever', str:''}
    ])
    t.tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.lessUntilType(/text/).tokens.should.eql([])
    t.lessUntilType(/token/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.tokens.should.eql([])
  })

  it('returns empty TokenString when there is no such value', function () {
    var t = new TokenString();
    t.lessUntilType(/.+/).tokens.should.eql([])

    t = new TokenString();
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.lessUntilType(/nnnnn/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'},
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })
})

describe('TokenString.tailUntilType', function () {

  it('can retrieve ending nodes until given type pattern', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.tailUntilType(/text/).tokens.should.eql([])
    t.tailUntilType(/token/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })

  it('does change original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')

    t.tailUntilType(/text/).tokens.should.eql([])
    t.tailUntilType(/token/).tokens.should.eql([
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
    t.tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'},
      {type:'token:whatever', str:''}
    ])
    t.tailUntilType(/token/).tokens.should.eql([])
    t.tailUntilType(/text/).tokens.should.eql([
      {type:'token:whatever', str:''}
    ])
    t.tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.tailUntilType(/token/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'}
    ])
    t.tokens.should.eql([])
  })

  it('returns empty TokenString when there is no such value', function () {
    var t = new TokenString();
    t.tailUntilType(/.+/).tokens.should.eql([])

    t = new TokenString();
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    t.tailUntilType(/nnnnn/).tokens.should.eql([
      {type:'text', str:'some text '},
      {type:'text', str:'here and there'},
      {type:'token:whatever', str:''},
      {type:'text', str:'--'},
      {type:'text', str:'--'}
    ])
  })
})

describe('TokenString.forEach', function () {

  it('can iterate items', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    var g = 0
    var k = 0
    t.forEach(function(c, i){
      g=i
      k = c
    })
    g.should.eql(t.length()-1)
    k.str.should.eql('--')
    t.first().str.should.eql('some text ')
  })

  it('does iterate a copy of the original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    var g = 0
    var k = 0
    var originalLen = t.length()
    t.forEach(function(c, i){
      g=i
      k = c
      t.shift()
    })
    g.should.eql(originalLen-1)
    k.str.should.eql('--')
    t.length().should.eql(0)
  })
})

describe('TokenString.forEachReversed', function () {

  it('can backward iterate items', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    var g = 0
    var k = 0
    t.forEachReversed(function(c, i){
      g=i
      k = c
    })
    g.should.eql(0)
    k.str.should.eql('some text ')
    t.first().str.should.eql('some text ')
  })

  it('does backward iterate a copy of the original array', function () {
    var t = new TokenString()
    t.prependStr('some text ')
    t.appendStr('here and there')
    t.append({type:'token:whatever'})
    t.appendStr('--')
    t.appendStr('--')
    var g = 0
    var k = 0
    t.forEachReversed(function(c, i){
      g=i
      k = c
      t.shift()
    })
    g.should.eql(0)
    k.str.should.eql('some text ')
    t.length().should.eql(0)
  })
})
