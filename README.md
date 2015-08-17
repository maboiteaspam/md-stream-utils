# md-stream-utils

Set of utilities to work with Markdown.

The basis of this work come from https://github.com/alanshaw/md-tokenizer

An alternative to https://github.com/chjj/marked

## Installation
Run the following commands to download and install the application:

*Binary install*
```sh   npm i md-stream-utils -g ```

*API install*
```sh   npm i md-stream-utils --save ```

## Usage

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


__md-colorize:__ A binary tool to colorize Markdown content.

    md-colorize [inputfile [outputfile]]
    
+ Display 'Usage' section from `stdin` with color:

    `cat README.md | md-paragraph -c 'Usage' | md-colorize`
    
+ Display 'Usage' section from a `file` with color:

    `md-paragraph -c 'Usage' README.md | md-colorize`


## API

Please check module index file.

For example to tokenize, format, color, 
and output a mardown file with interactive 
support, 
it looks like this

```js
    var pumpable = new mds.PausableStream()
    pumpable.pause()
    input
      .pipe(mds.toTokenString())
      .pipe(argv._.length > 0 ? pumpable.stream : through2.obj())
      .pipe(mds.tokenize())
      .pipe(mds.format())
      .pipe(mds.colorize())
      .pipe(argv._.length > 0 ? mds.less(pumpable) : through2.obj())
      .pipe(mds.flattenToString(mds.resolveColors.transform))
      .pipe(output)
```

There are a bunch of filters, transformers available under `lib/`.

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

- improve the tests
- provide configurable colors
- fix background display
