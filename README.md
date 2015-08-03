# md-stream-utils

Set of utilities to work with Markdown.

The basis of this work come from https://github.com/alanshaw/md-tokenizer

An alternative to https://github.com/chjj/marked

It provide a binary tool to read colorized markdown content with interactive support : `md-colorize`

![Interactive MD support](https://raw.githubusercontent.com/maboiteaspam/md-stream-utils/gh-pages/screencast.gif)

## Installation
Run the following commands to download and install the application:

*Binary install*
```sh   npm i md-stream-utils -g ```

*API install*
```sh   npm i md-stream-utils --save ```

## Usage

__md-colorize:__ A binary tool to colorize Markdown content. It embed support for interactive navigation like `less`.

    md-colorize [inputfile [outputfile]]
    
+ Display 'Usage' section from `stdin` with color:

    `cat README.md | md-paragraph -c 'Usage' | md-colorize`
    
+ Display 'Usage' section from a `file` with color:

    `md-paragraph -c 'Usage' README.md | md-colorize`
    

__md-block:__ A binary tool to parse Markdown content by block.

    mb-block [inputfile [outputfile]] [-c 'content'] [-t 'text']
    
    -c | --content    Content to match.
    -t | --type       Block type to match.

+ Display 'Usage' heading from stdin:

    `cat README.md | md-block -c 'Usage' -t 'heading'`
    
+ Display 'Usage' heading from a file:

    `md-block -c 'Usage' -t 'heading' README.md`


__md-paragraph:__ A binary tool to parse Markdown content by paragraph.

    mb-paragraph [inputfile [outputfile]] [-c 'content']
    
    -c | --content    Content to match.
    
+ Display 'Usage' section from stdin:

    `cat README.md | md-paragraph -c 'Usage'`
    
+ Display 'Usage' section from a file:

    `md-paragraph -c 'Usage' README.md`


## API

`md-stream-utils` comes with several stream transform modules.

```js
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
```

__tokenizer__

- It is the original https://github.com/alanshaw/md-tokenizer

```js
    var mdUtils = require('../index.js')
    
    process.stdin
      .pipe(mdUtils.tokenizer())
      .pipe(mdUtils.toString())
      .pipe(process.stdout)
```

__byLine__

- Transforms a `stream of nodes` into a `stream of array of nodes`.
- Each push represents a line.

```js
    var mdUtils = require('../index.js')
        
    process.stdin
      .pipe(mdUtils.tokenizer())
      .pipe(mdUtils.byLine())
      .pipe(mdUtils.cliColorize())
      .pipe(mdUtils.toString({append: '--'}))
      .pipe(process.stdout)
```

__byBlock__

- Transforms a `stream of nodes` into a `stream of array of nodes`.
- Each push is an `array of nodes` representing a `block`.
- A `block` is an `array of nodes` starting with one of `heading`, `code-block`, `list-item` nodes.

```js
    var mdUtils = require('../index.js')
    
    process.stdin
      .pipe(mdUtils.tokenizer())
      .pipe(mdUtils.byBlock())
      .pipe(mdUtils.cliColorize())
      .pipe(mdUtils.toString({append: '--'}))
      .pipe(process.stdout)

```

__byParapgraph__

- Transforms a `stream of array of nodes` or a `stream of nodes` into a `stream of array of nodes`.
- Each push is an `array of nodes` representing a `paragraph`.
- A `paragraph` is an `array of nodes` starting with a `heading` node and an ending with a `new line` node.

```js
    var mdUtils = require('../index.js')
    
    process.stdin
      .pipe(mdUtils.tokenizer())
      .pipe(mdUtils.byParapgraph())
      .pipe(mdUtils.cliColorize())
      .pipe(mdUtils.toString({append: '--'}))
      .pipe(process.stdout)
```

__cliColorize__

- Transforms a `stream of array of nodes` or a `stream of nodes` into a corresponding colorized stream with `chalk`.
- Each push is an `array of nodes` or a `node`.

```js
    var mdUtils = require('../index.js')
    
    process.stdin
      .pipe(mdUtils.tokenizer())
      .pipe(mdUtils.cliColorize())
      .pipe(mdUtils.toString())
      .pipe(process.stdout)
```

__flatten__

- Transforms a `stream of array of nodes` or a `stream of nodes` into a `stream of nodes`.
- Each push represents a `node`.

```js
    var mdUtils = require('../index.js')
    process.stdin
      .pipe(mdUtils.tokenizer())
      .pipe(mdUtils.byParapgraph())
      .pipe(mdUtils.flatten())
      .pipe(mdUtils.toString())
      .pipe(process.stdout)
```

__filter__

- Filters a `stream of array of nodes` or a `stream of nodes`.
- Each push represents a `node`.

```js
    var mdUtils = require('../index.js')
        
    process.stdin
      .pipe(mdUtils.tokenizer())
      .pipe(mdUtils.filter({type: 'text'}))
      .pipe(mdUtils.cliColorize())
      .pipe(mdUtils.toString())
      .pipe(process.stdout)
```

__less__

- Filters a `stream of array of nodes`, they must be `lines`.
- Controls output buffer with help of `keyup` `keydown` keyboard controls.
- Each push is an `array of nodes`, a `line` of text.

```js
    var mdUtils = require('../index.js')
        
    process.stdin
      .pipe(mdUtils.tokenizer())
      .pipe(mdUtils.filter({type: 'text'}))
      .pipe(mdUtils.cliColorize())
      .pipe(mdUtils.byLine())
      .pipe(mdUtils.less())
      .pipe(mdUtils.toString())
      .pipe(process.stdout)
```

__toString__

- Transforms a `stream of array of nodes` or a `stream of nodes` into a `stream of strings`.
- Each push is a `string` representing a `node` or an `array of nodes`.

```js
    var mdUtils = require('../index.js')
    
    process.stdin
      .pipe(mdUtils.tokenizer())
      .pipe(mdUtils.cliColorize())
      .pipe(mdUtils.toString())
      .pipe(process.stdout)
```

__toJSON__

- Transforms a `stream of array of nodes` or a `stream of nodes` into a `stream of json strings`.
- Each push is a `json string` representing a `node` or an `array of nodes`.

```js
    var mdUtils = require('../index.js')
    
    process.stdin
      .pipe(mdUtils.tokenizer())
      .pipe(mdUtils.cliColorize())
      .pipe(mdUtils.toJSON())
      .pipe(process.stdout)
```



## How to contribute

1. File an issue in the repository, using the bug tracker, describing the
   contribution you'd like to make. This will help us to get you started on the
   right foot.
2. Fork the project in your account and create a new branch:
   `your-great-feature`.
3. Commit your changes in that branch.
4. Open a pull request, and reference the initial issue in the pull request
   message.

## License
See the [LICENSE](./LICENSE) file.

## Notes

It is not perfectly github markdown compatible.

## Todo

write the tests
