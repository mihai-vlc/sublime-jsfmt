doc = """Naval Fate.

Usage:
  naval_fate.coffee ship new <name>...
  naval_fate.coffee ship <name> move <x> <y> [--speed=<kn>]
  naval_fate.coffee ship shoot <x> <y>
  naval_fate.coffee mine (set|remove) <x> <y> [--moored|--drifting]
  naval_fate.coffee -h | --help
  naval_fate.coffee --version

Options:
  -h --help     Show this screen.
  --version     Show version.
  --speed=<kn>  Speed in knots [default: 10].
  --moored      Moored (anchored) mine.
  --drifting    Drifting mine.

"""
{docopt} = require '../docopt'

console.log docopt(doc, version: '2.0')
