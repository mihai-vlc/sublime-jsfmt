doc = """Usage: odd_even_example.coffee [-h | --help] (ODD EVEN)...

Example, try:
  odd_even_example.coffee 1 2 3 4

Options:
  -h, --help

"""
{docopt} = require '../docopt'

console.log docopt(doc)
