`docopt` – command line option parser, that will make you smile
===============================================================================

> [docopt](http://docopt.org/) is a language for description of command-line
> interfaces. This is `docopt` implementation in CoffeeScript, that could
> be used for server-side CoffeeScript and JavaScript programs.

Isn't it awesome how modern command-line arguments parsers generate
help message based on your code?!

Hell no!  You know what's awesome?  It's when the option parser *is* generated
based on the help message that you write yourself!  This way
you don't need to write this stupid repeatable parser-code, and instead can
write a beautiful help message (the way you want it!), which adds readability
to your code.

Now you can write an awesome, readable, clean, DRY code like *that*:

```coffeescript
doc = """
Usage:
  quick_example.coffee tcp <host> <port> [--timeout=<seconds>]
  quick_example.coffee serial <port> [--baud=9600] [--timeout=<seconds>]
  quick_example.coffee -h | --help | --version

"""
{docopt} = require '../docopt'

console.log docopt(doc, version: '0.1.1rc')
```

Hell yeah! The option parser is generated based on `doc` string above, that you
pass to the `docopt` function.

API `{docopt} = require 'docopt'`
===============================================================================

###`options = docopt(doc, {argv: process.argv[2..], help: true, version: null})`

`docopt` takes 1 required and 3 optional keyword arguments:

- `doc` should be a string with help message, written according to rules
of [docopt language](http://docopt.org). Here is a quick example of such
a string:

        Usage: your_program [options]

        -h --help     Show this.
        -v --verbose  Print more text.
        --quiet       Print less text.
        -o FILE       Specify output file [default: ./test.txt].

- `argv` is an optional argument vector; by default it is the argument vector
passed to your program (`process.argv[2..]`). You can supply it with an array
of strings (similar to `process.argv`) e.g. ['--verbose', '-o', 'hai.txt'].

- `help`, by default `true`, specifies whether the parser should automatically
print the help message (supplied as `doc`) in case `-h` or `--help` options
are encountered. After showing the usage-message, the program will terminate.
If you want to handle `-h` or `--help` options manually (as all other options),
set `help=false`.

- `version`, by default `null`, is an optional argument that specifies the
version of your program. If supplied, then, if the parser encounters
`--version` option, it will print the supplied version and terminate.
`version` could be any printable object, but most likely a string,
e.g. `'2.1.0rc1'`.

Note, when `docopt` is set to automatically handle `-h`, `--help` and
`--version` options, you still need to mention them in the options description
(`doc`) for your users to know about them.

The **return** value is an Object with properties
(giving long options precedence), e.g:

    {'--timeout': '10',
     '--baud': '4800',
     '--version': false,
     '--help': false,
     '-h': false,
     serial: true,
     tcp: false,
     '<host>': false,
     '<port>': '/dev/ttyr01'}
