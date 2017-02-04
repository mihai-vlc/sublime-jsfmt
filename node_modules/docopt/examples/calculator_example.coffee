doc = """Not a serious example.

Usage:
  calculator_example.coffee <value> ( ( + | - | * | / ) <value> )...
  calculator_example.coffee <function> <value> [( , <value> )]...
  calculator_example.coffee (-h | --help)

Examples:
  calculator_example.coffee 1 + 2 + 3 + 4 + 5
  calculator_example.coffee 1 + 2 '*' 3 / 4 - 5    # note quotes around '*'
  calculator_example.coffee sum 10 , 20 , 30 , 40

Options:
  -h, --help

"""
{docopt} = require '../docopt'

console.log docopt(doc)
