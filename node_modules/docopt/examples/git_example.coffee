doc = """
Usage:
    git_example.coffee remote [-v | --verbose]
    git_example.coffee remote add [-t <branch>] [-m <master>] [-f]
                   [--tags|--no-tags] [--mirror] <name> <url>
    git_example.coffee remote rename <old> <new>
    git_example.coffee remote rm <name>
    git_example.coffee remote set-head <name> (-a | -d | <branch>)
    git_example.coffee remote set-branches <name> [--add] <branch>...
    git_example.coffee remote set-url [--push] <name> <newurl> [<oldurl>]
    git_example.coffee remote set-url --add [--push] <name> <newurl>
    git_example.coffee remote set-url --delete [--push] <name> <url>
    git_example.coffee remote [-v | --verbose] show [-n] <name>
    git_example.coffee remote prune [-n | --dry-run] <name>
    git_example.coffee remote [-v | --verbose] update [-p | --prune]
                   [(<group> | <remote>)...]

Options:
    -v, --verbose
    -t <branch>
    -m <master>
    -f
    --tags
    --no-tags
    --mittor
    -a
    -d
    -n, --dry-run
    -p, --prune
    --add
    --delete
    --push
    --mirror

"""
{docopt} = require '../docopt'

console.log docopt(doc, version: '2.0')
