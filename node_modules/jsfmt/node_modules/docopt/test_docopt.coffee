print = () -> console.log.apply @, [].slice.call(arguments)


class WasNotRaisedError extends Error

[setup, teardown, test, eq] = (() ->
    cl   = console.log
    proc = process
    ps   = process.stdout
    buffer   = ''
    setsize  = 0
    number   = 0
    passes   = 0
    failures = 0
    results  = []

    [(f) ->
        results = []
        console.log = -> buffer += ([].join.call arguments, ' ') + '\n'
        pseudoso =
            write: -> buffer += [].join.call arguments, ' '
        process.stdout = pseudoso
        process.exit = ->

        if f then f() else null

        cl '================================================================'

    (f) ->
        cl ''
        console.log = cl
        proc.stdout = ps

        if f then f() else null

        for result in results
            if result[0] == 'F'
                ++failures
                half = (56 - result[1].length)/2
                if half > 0
                    [left, right] = [new Array(half + half%1).join('=') + ' ',
                               ' ' + new Array(half - half%1).join('=')]
                else
                    [left, right] = ['', '']
                cl "#{left}In test #{result[1]}#{right}"
                cl "#{result[2]}"
                if result[3] isnt ''
                    cl '------------------------ captured stdout -----------------------'
                    cl result[3]
             else
                 ++passes

        cl '================================================================'
        cl((result[0] for result in results).join(''))
        cl "#{passes} successes, #{failures} failures"
        cl '================================================================'

    (n, f) ->
        ps.write "collecting #{++number} item(s)\r"
        try
            f()
            results.push ['.', "#{n} ##{setsize}", 'ok', buffer]
        catch e
            results.push ['F', "#{n} ##{setsize}", e.stack or e.message, buffer]
        buffer = ''
        setsize = 0

    (a, b) ->
        as = a.toString()
        bs = b.toString()
        setsize++
        if as == bs then return else throw new Error "#{as} != #{bs}"]
)()

setup()

#{new Option, TokenStream, parse_shorts, parse_long,
#                   parse_args, printable_usage, docopt} = module
`with (require('./docopt')) { //`

test "Option.parse", ->
    eq(
        Option.parse('-h')
        new Option('-h', null)
    )
    eq(
        Option.parse('-h')
        new Option('-h', null)
    )
    eq(
        Option.parse '--help'
        new Option null, '--help'
    )
    eq(
        Option.parse '-h --help'
        new Option '-h', '--help'
    )
    eq(
        Option.parse '-h, --help'
        new Option '-h', '--help'
    )

    eq(
        Option.parse '-h TOPIC'
        new Option '-h', null, 1
    )
    eq(
        Option.parse '--help TOPIC'
        new Option null, '--help', 1
    )
    eq(
        Option.parse '-h TOPIC --help TOPIC'
        new Option '-h', '--help', 1
    )
    eq(
        Option.parse '-h TOPIC, --help TOPIC'
        new Option '-h', '--help', 1
    )
    eq(
        Option.parse '-h TOPIC, --help=TOPIC'
        new Option '-h', '--help', 1
    )

    eq(
        Option.parse '-h  Description...'
        new Option '-h', null
    )
    eq(
        Option.parse '-h --help  Description...'
        new Option '-h', '--help'
    )
    eq(
        Option.parse '-h TOPIC  Description...'
        new Option '-h', null, 1
    )

    eq(
        Option.parse '    -h'
        new Option '-h', null
    )

    eq(
        Option.parse '-h TOPIC  Descripton... [default: 2]'
        new Option '-h', null, 1, '2'
    )
    eq(
        Option.parse '-h TOPIC  Descripton... [default: topic-1]'
        new Option '-h', null, 1, 'topic-1'
    )
    eq(
        Option.parse '--help=TOPIC  ... [default: 3.14]'
        new Option null, '--help', 1, '3.14'
    )
    eq(
        Option.parse '-h, --help=DIR  ... [default: ./]'
        new Option '-h', '--help', 1, "./"
    )

test "TokenStream", ->
    eq new TokenStream(['-o', 'arg']), ['-o', 'arg']
    eq new TokenStream('-o arg'), ['-o', 'arg']
    eq new TokenStream('-o arg').shift(), '-o'
    eq new TokenStream('-o arg').current(), '-o'

test "parse_shorts", ->
    eq(
        parse_shorts(
            new TokenStream '-a'
            [new Option '-a']
        )
        [new Option '-a', null, 0, true]
    )
    eq(
        parse_shorts(
            new TokenStream '-ab'
            [
                new Option '-a'
                new Option '-b'
            ]
        )
        [
            new Option '-a', null, 0, true
            new Option '-b', null, 0, true
        ]
    )
    eq(
        parse_shorts(
            new TokenStream '-b'
            [
                new Option '-a'
                new Option '-b'
            ]
        )
        [new Option '-b', null, 0, true]
    )
    eq(
        parse_shorts(
            new TokenStream '-aARG'
            [new Option '-a', null, 1]
        )
        [new Option '-a', null, 1, 'ARG']
    )
    eq(
        parse_shorts(
            new TokenStream '-a ARG'
            [new Option '-a', null, 1]
        )
        [new Option '-a', null, 1, 'ARG']
    )

test "parse_long", ->
    eq(
        parse_long(
            new TokenStream '--all'
            [new Option null, '--all']
        )
        [new Option null, '--all', 0, true]
    )
    eq(
        parse_long(
            new TokenStream '--all'
            [
                new Option null, '--all'
                new Option null, '--not'
            ]
        )
        [new Option null, '--all', 0, true]
    )
    eq(
        parse_long(
            new TokenStream '--all=ARG'
            [new Option null, '--all', 1]
        )
        [new Option null, '--all', 1, 'ARG']
    )
    eq(
        parse_long(
            new TokenStream '--all ARG'
            [new Option null, '--all', 1]
        )
        [new Option null, '--all', 1, 'ARG']
    )

test "parse_args", ->
    test_options = [new Option(null, '--all'), new Option('-b'), new Option('-W', null, 1)]
    eq(
        parse_args '--all -b ARG', test_options
        [
            new Option null, '--all', 0, true
            new Option '-b', null, 0, true
            new Argument null, 'ARG'
        ]
    )
    eq(
        parse_args 'ARG -Wall', test_options
        [
            new Argument null, 'ARG'
            new Option '-W', null, 1, 'all'
        ]
    )


test "Pattern.flat()", ->
    eq new Required([new OneOrMore([new Argument('N')]),
        new Option('-a'), new Argument('M')]).flat(),
        [new Argument('N'), new Option('-a'), new Argument('M')]


test "option_name", ->
  eq new Option('-h', null).name(), '-h'
  eq new Option('-h', '--help').name(), '--help'
  eq new Option(null, '--help').name(), '--help'


test "any_options", ->
    doc = '''Usage: prog [options] A

    -q  Be quiet
    -v  Be verbose.'''
    eq docopt(doc, {'argv': 'arg'}), new Dict([['A', 'arg'], ['-v', false], ['-q', false]])
    eq docopt(doc, {'argv': '-v arg'}), new Dict([['A', 'arg'], ['-v', true], ['-q', false]])
    eq docopt(doc, {'argv': '-q arg'}), new Dict([['A', 'arg'], ['-v', false], ['-q', true]])


test "commands", ->
    eq docopt('Usage: prog add', {'argv': 'add'}), new Dict([['add', true]])
    eq docopt('Usage: prog [add]', {'argv': ' '}), new Dict([['add', false]])
    eq docopt('Usage: prog [add]', {'argv': 'add'}), new Dict([['add', true]])
    eq docopt('Usage: prog (add|rm)', {'argv': 'add'}), new Dict([['add', true], ['rm', false]])
    eq docopt('Usage: prog (add|rm)', {'argv': 'rm'}), new Dict([['add', false], ['rm', true]])
    eq docopt('Usage: prog a b', {'argv': 'a b'}), new Dict([['a', true], ['b', true]])
    #with raises(DocoptExit):
    #    assert docopt('Usage: prog a b', 'b a')


test "parse_doc_options", ->
    doc = '''-h, --help  Print help message.
    -o FILE     Output file.
    --verbose   Verbose mode.'''
    eq(
        parse_doc_options doc
        [
            new Option '-h', '--help'
            new Option '-o', null, 1
            new Option null, '--verbose'
        ]
    )


test "printable_and_formal_usage", ->
    doc = """
    Usage: prog [-hv] ARG
           prog N M

    prog is a program."""
    eq printable_usage(doc), "Usage: prog [-hv] ARG\n       prog N M"
    eq formal_usage(printable_usage(doc)), "[-hv] ARG | N M"
    eq printable_usage('uSaGe: prog ARG\n\t \t\n bla'), "uSaGe: prog ARG"


test "parse_args2", ->
    o = [new Option('-h'), new Option('-v', '--verbose'), new Option('-f', '--file', 1)]
    eq(
        parse_args '', o
        []
    )
    eq(
        parse_args '-h', o
        [new Option '-h', null, 0, true]
    )
    eq(
        parse_args '-h --verbose', o
        [
            new Option '-h', null, 0, true
            new Option '-v', '--verbose', 0, true
        ]
    )
    eq(
        parse_args '-h --file f.txt', o
        [
            new Option '-h', null, 0, true
            new Option '-f', '--file', 1, 'f.txt'
        ]
    )
    eq(
        parse_args '-h --file f.txt arg', o
        [
            new Option '-h', null, 0, true
            new Option '-f', '--file', 1, 'f.txt'
            new Argument null, 'arg'
        ]
    )
    eq(
        parse_args '-h --file f.txt arg arg2', o
        [
            new Option '-h', null, 0, true
            new Option '-f', '--file', 1, 'f.txt'
            new Argument null, 'arg'
            new Argument null, 'arg2'
        ]
    )
    eq(
        parse_args '-h arg -- -v', o
        [
            new Option '-h', null, 0, true
            new Argument null, 'arg'
            new Argument null, '--'
            new Argument null, '-v'
        ]
    )


test "parse_pattern", ->
    o = [
        new Option '-h'
        new Option '-v', '--verbose'
        new Option '-f', '--file', 1
    ]
    eq(
        parse_pattern('[ -h ]', o)
        new Required [
            new Optional [
                new Option '-h', null, 0, true
            ]
        ]
    )
    eq(
        parse_pattern '[ ARG ... ]', o
        new Required [
            new Optional [
                new OneOrMore [
                    new Argument 'ARG'
                ]
            ]
        ]
    )
    eq(
        parse_pattern('[ -h | -v ]', o)
        new Required [
            new Optional [
                new Either [
                    new Option '-h', null, 0, true
                    new Option '-v', '--verbose', 0, true
                ]
            ]
        ]
    )
    eq(
        parse_pattern '( -h | -v [ --file f.txt ] )', o
        new Required [
            new Required [
                new Either [
                    new Option '-h', null, 0, true
                    new Required [
                        new Option '-v', '--verbose', 0, true
                        new Optional [
                            new Option '-f', '--file', 1, 'f.txt'
                        ]
                    ]
                ]
            ]
        ]
    )
    eq(
        parse_pattern '(-h|-v[--file=f.txt]N...)', o
        new Required [
            new Required [
                new Either [
                    new Option '-h', null, 0, true
                    new Required [
                        new Option '-v', '--verbose', 0, true
                        new Optional [
                            new Option '-f', '--file', 1, 'f.txt'
                        ]
                        new OneOrMore [
                            new Argument 'N'
                        ]
                    ]
                ]
            ]
        ]
    )
    eq parse_pattern('(N [M | (K | L)] | O P)', []), \
               new Required([new Required([new Either([
                   new Required([new Argument('N'),
                            new Optional([new Either([new Argument('M'),
                                            new Required([new Either([new Argument('K'),
                                                            new Argument('L')])])])])]),
                   new Required([new Argument('O'), new Argument('P')])])])])
    eq parse_pattern('[ -h ] [N]', o), \
               new Required([new Optional([new Option('-h', null, 0, true)]),
                        new Optional([new Argument('N')])])
    eq parse_pattern('[options]', o), new Required([
                new Optional([new AnyOptions()])])
    eq parse_pattern('[options] A', o), new Required([
                new Optional([new AnyOptions()]),
                new Argument('A')])
    eq parse_pattern('-v [options]', o), new Required([
                new Option('-v', '--verbose', 0, true),
                new Optional([new AnyOptions([])])])

    eq parse_pattern('ADD', o), new Required([new Argument('ADD')])
    eq parse_pattern('<add>', o), new Required([new Argument('<add>')])
    eq parse_pattern('add', o), new Required([new Command('add')])


test "option_match", ->
    eq new Option('-a').match([new Option('-a')]), [true, [], []]
    eq new Option('-a').match([new Option('-x')]), [false, [new Option('-x')], []]
    eq new Option('-a').match([new Argument('N')]), [false, [new Argument('N')], []]
    eq new Option('-a').match([new Option('-x'), new Option('-a'), new Argument('N')]), \
            [true, [new Option('-x'), new Argument('N')], []]
    eq new Option('-a', null, false).match([new Option('-a', null, false)]), \
            [true, [], []]


test "argument_match", ->
    eq new Argument('N').match([new Argument(null, 9)]), [true, [], [new Argument('N', 9)]]
    eq new Argument('N').match([new Option('-x')]), [false, [new Option('-x')], []]
    eq new Argument('N').match([new Option('-x'), new Option('-a'), new Argument(null, 5)])\
           , [true, [new Option('-x'), new Option('-a')], [new Argument('N', 5)]]
    eq new Argument('N').match([new Argument(null, 9), new Argument(null, 0)]), [
            true, [new Argument(null, 0)], [new Argument('N', 9)]]


test "command_match", ->
    eq new Command('c').match([new Argument(null, 'c')]), [
            true, [], [new Command('c', true)]]
    eq new Command('c').match([new Option('-x')]), [false, [new Option('-x')], []]
    eq new Command('c').match([new Option('-x'), new Option('-a'),
                               new Argument(null, 'c')]), [
            true, [new Option('-x'), new Option('-a')], [new Command('c', true)]]
    eq new Either([new Command('add', false), new Command('rm', false)]).match(
            [new Argument(null, 'rm')]), [true, [], [new Command('rm', true)]]


test "optional_match", ->
    eq new Optional([new Option('-a')]).match([new Option('-a')]), [true, [], []]
    eq new Optional([new Option('-a')]).match([]), [true, [], []]
    eq new Optional([new Option('-a')]).match([new Option('-x')]), [
            true, [new Option('-x')], []]
    eq new Optional([new Option('-a'), new Option('-b')]).match([new Option('-a')]), [
            true, [], []]
    eq new Optional([new Option('-a'), new Option('-b')]).match([new Option('-b')]), [
            true, [], []]
    eq new Optional([new Option('-a'), new Option('-b')]).match([new Option('-x')]), [
            true, [new Option('-x')], []]
    eq new Optional([new Argument('N')]).match([new Argument(null, 9)]), [
            true, [], [new Argument('N', 9)]]


test "required_match", ->
    eq new Required([new Option('-a')]).match([new Option('-a')]), [true, [], []]
    eq new Required([new Option('-a')]).match([]), [false, [], []]
    eq new Required([new Option('-a')]).match([new Option('-x')]), [
            false, [new Option('-x')], []]
    eq new Required([new Option('-a'), new Option('-b')]).match([new Option('-a')]), [
            false, [new Option('-a')], []]
    eq new Optional([new Option('-a'), new Option('-b')]).match(
            [new Option('-b'), new Option('-x'), new Option('-a')]), [
                    true, [new Option('-x')], []]


test "either_match", ->
    eq new Either([new Option('-a'), new Option('-b')]).match(
            [new Option('-a')]), [true, [], []]
    eq new Either([new Option('-a'), new Option('-b')]).match(
            [new Option('-a'), new Option('-b')]), [true, [new Option('-b')], []]
    print new Either([new Option('-a'), new Option('-b')]).match(
            [new Option('-x')])
    eq new Either([new Option('-a'), new Option('-b')]).match(
            [new Option('-x')]), [false, [new Option('-x')], []]
    print "success"
    eq new Either([new Option('-a'), new Option('-b'), new Option('-c')]).match(
            [new Option('-x'), new Option('-b')]), [true, [new Option('-x')], []]
    eq new Either([new Argument('M'),
                  new Required([new Argument('N'), new Argument('M')])]).match(
                                   [new Argument(null, 1), new Argument(null, 2)]), \
            [true, [], [new Argument('N', 1), new Argument('M', 2)]]


test "one_or_more_match", ->
    eq new OneOrMore([new Argument('N')]).match([new Argument(null, 9)]), [
            true, [], [new Argument('N', 9)]]
    eq new OneOrMore([new Argument('N')]).match([]), [false, [], []]
    eq new OneOrMore([new Argument('N')]).match([new Option('-x')]), \
            [false, [new Option('-x')], []]
    eq new OneOrMore([new Argument('N')]).match(
            [new Argument(null, 9), new Argument(null, 8)]), [
                    true, [], [new Argument('N', 9), new Argument('N', 8)]]
    eq new OneOrMore([new Argument('N')]).match(
            [new Argument(null, 9), new Option('-x'), new Argument(null, 8)]), [
                    true, [new Option('-x')], [new Argument('N', 9), new Argument('N', 8)]]
    eq new OneOrMore([new Option('-a')]).match(
            [new Option('-a'), new Argument(null, 8), new Option('-a')]), [
                    true, [new Argument(null, 8)], []]
    eq new OneOrMore([new Option('-a')]).match([new Argument(null, 8), new Option('-x')]), [
                    false, [new Argument(null, 8), new Option('-x')], []]
#   NOTE, new Option is greedy, nothing to match second time
#   eq new OneOrMore(new Required(new Option('-a'), new Argument('N'))).match(
#           [new Option('-a'), new Argument(null, 1), new Option('-x'),
#            new Option('-a'), new Argument(null, 2)]), \
#                    (true, [new Option('-x')], [new Argument('N', 1), new Argument('N', 2)])
    eq new OneOrMore([new Optional([new Argument('N')])]).match([new Argument(null, 9)]), \
                    [true, [], [new Argument('N', 9)]]


test "list_argument_match", ->
    eq new Required([new Argument('N'), new Argument('N')]).fix().match(
            [new Argument(null, 1), new Argument(null, 2)]), \
                    [true, [], [new Argument('N', [1, 2])]]
    eq new OneOrMore([new Argument('N')]).fix().match(
            [new Argument(null, 1), new Argument(null, 2), new Argument(null, 3)]), \
                    [true, [], [new Argument('N', [1, 2, 3])]]
    eq new Required([new Argument('N'), new OneOrMore([new Argument('N')])]).fix().match(
            [new Argument(null, 1), new Argument(null, 2), new Argument(null, 3)]), \
                    [true, [], [new Argument('N', [1, 2, 3])]]
    eq new Required([new Argument('N'), new Required([new Argument('N')])]).fix().match(
            [new Argument(null, 1), new Argument(null, 2)]), \
                    [true, [], [new Argument('N', [1, 2])]]


test "basic_pattern_matching", ->
    # ( -a N [ -x Z ] )
    pattern = new Required [
        new Option '-a'
        new Argument 'N'
        new Optional [
            new Option '-x'
            new Argument 'Z'
        ]
    ]
    # -a N
    eq(
        pattern.match [
            new Option '-a'
            new Argument null, 9
        ]
        [true, [], [new Argument 'N', 9]]
    )
    # -a -x N Z
    eq(
        pattern.match [
            new Option '-a'
            new Option '-x'
            new Argument null, 9
            new Argument null, 5
        ]
        [true, [], [
            new Argument 'N', 9
            new Argument 'Z', 5
        ]]
    )
    # -x N Z  # BZZ!
    eq(
        pattern.match [
            new Option '-x'
            new Argument null, 9
            new Argument null, 5
        ]
        [false, [
            new Option '-x'
            new Argument null, 9
            new Argument null, 5
        ], []]
    )

test "pattern_any_option", ->
    eq(
        new AnyOptions().match [
            new Option '-a'
        ]
        [true, [], []]
    )
    eq(
        new AnyOptions().match [
            new Option '-b'
        ]
        [true, [], []]
    )
    eq(
        new AnyOptions().match [
            new Option '-l', '--long'
        ]
        [true, [], []]
    )
    eq(
        new AnyOptions().match [
            new Option null, '--long'
        ]
        [true, [], []]
    )
    eq(
        new AnyOptions().match [
            new Option '-a'
            new Option '-b'
        ]
        [true, [], []]
    )
    eq(
        new AnyOptions().match [
            new Option '-a'
            new Option null, '-long'
        ]
        [true, [], []]
    )
    #eq not new AnyOptions().match([new Argument('N')])[0]


test "pattern_either", ->
    eq(
        new Option('-a').either()
        new Either [
            new Required [
                new Option '-a'
            ]
        ]
    )
    eq(
        new Argument('A').either()
        new Either [
            new Required [
                new Argument 'A'
            ]
        ]
    )
    eq(
        new Required([
            new Either [
                new Option '-a'
                new Option '-b'
            ]
            new Option '-c'
        ]).either()
        new Either [
            new Required [
                new Option '-a'
                new Option '-c'
            ]
            new Required [
                new Option '-b'
                new Option '-c'
            ]
        ]
    )
    eq(
        new Optional([
            new Option '-a'
            new Either [
                new Option '-b'
                new Option '-c'
            ]
        ]).either()
        new Either [
            new Required [
                new Option '-b'
                new Option '-a'
            ]
            new Required [
                new Option '-c'
                new Option '-a'
            ]
        ]
    )
    eq(
        new Either([
            new Option '-x'
            new Either [
                new Option '-y'
                new Option '-z'
            ]
        ]).either()
        new Either [
            new Required [
                new Option '-x'
            ]
            new Required [
                new Option '-y'
            ]
            new Required [
                new Option '-z'
            ]
        ]
    )
    eq(
        new OneOrMore([
            new Argument 'N'
            new Argument 'M'
        ]).either()
        new Either [
            new Required [
                new Argument 'N'
                new Argument 'M'
                new Argument 'N'
                new Argument 'M'
            ]
        ]
    )


test "pattern_fix_list_arguments", ->
    eq(
        new Option('-a').fix_list_arguments()
        new Option '-a'
    )
    eq(
        new Argument('N', null).fix_list_arguments()
        new Argument 'N', null
    )
    eq(
        new Required([
            new Argument 'N'
            new Argument 'N'
        ]).fix_list_arguments()
        new Required [
            new Argument 'N', []
            new Argument 'N', []
        ]
    )
    eq(
        new Either([
            new Argument 'N'
            new OneOrMore [
                new Argument 'N'
            ]
        ]).fix()
        new Either [
            new Argument 'N', []
            new OneOrMore [
                new Argument 'N', []
            ]
        ]
    )


test "pattern_fix_identities_1", ->
    pattern = new Required [
        new Argument 'N'
        new Argument 'N'
    ]
    eq pattern.children[0], pattern.children[1]
    #pattern.children[0] isnt pattern.children[1]
    #pattern.fix_identities()
    #eq pattern.children[0] is pattern.children[1]


test "pattern_fix_identities_2", ->
    pattern = new Required [
        new Optional [
            new Argument 'X'
            new Argument 'N'
        ]
        new Argument 'N'
    ]
    eq pattern.children[0].children[1], pattern.children[1]
    #assert pattern.children[0].children[1] is not pattern.children[1]
    #pattern.fix_identities()
    #assert pattern.children[0].children[1] is pattern.children[1]


#test "long_options_error_handling", ->
    #with raises(UsageMessageError):
    #    docopt('Usage: prog --non-existent')
    #with raises(DocoptExit):
    #    docopt('Usage: prog', '--non-existent')
    #with raises(UsageMessageError):
    #    docopt('Usage: prog --ver\n\n--version\n--verbose')
    #with raises(DocoptExit):
    #    docopt('''Usage: prog [--version --verbose]\n\n
    #              --version\n--verbose''', '--ver')
    #with raises(UsageMessageError):
    #    docopt('Usage: prog --long\n\n--long ARG')
    #with raises(DocoptExit):
    #    docopt('Usage: prog --long ARG\n\n--long ARG', '--long')
    #with raises(UsageMessageError):
    #    docopt('Usage: prog --long=ARG\n\n--long')
    #with raises(DocoptExit):
    #    docopt('Usage: prog --long\n\n--long', '--long=ARG')


#test "short_options_error_handling", ->
#    with raises(UsageMessageError):
#        docopt('Usage: prog -x\n\n-x  this\n-x  that')
#
#    with raises(UsageMessageError):
#        docopt('Usage: prog -x')
#    with raises(DocoptExit):
#        docopt('Usage: prog', '-x')
#
#    with raises(UsageMessageError):
#        docopt('Usage: prog -o\n\n-o ARG')
#    with raises(DocoptExit):
#        docopt('Usage: prog -o ARG\n\n-o ARG', '-o')
#
#
#test "matching_paren", ->
#    with raises(UsageMessageError):
#        docopt('Usage: prog [a [b]')
#    with raises(UsageMessageError):
#        docopt('Usage: prog [a [b] ] c )')


test "allow_double_underscore_in_pattern", ->
    eq(
        docopt(
            'usage: prog [-o] [--] <arg>\n\n-o',
            'argv': '-- -o'
        )
        new Dict [
            ['--', true]
            ['-o', false]
            ['<arg>', '-o']
        ]
    )


test "allow_empty_pattern", ->
    docopt(
        'usage: prog'
        argv: ' '
    )


test "docopt", ->
    doc = '''Usage: prog [-v] A

    -v  Be verbose.'''
    eq(
        docopt(
            doc
            argv: 'arg'
        )
        new Dict [
            ['-v', false]
            ['A', 'arg']
        ]
    )
    eq(
        docopt(
            doc
            argv: '-v arg'
        )
        new Dict [
            ['-v', true]
            ['A', 'arg']
        ]
    )

    doc = """Usage: prog [-vqr] [FILE]
              prog INPUT OUTPUT
              prog --help

    Options:
      -v        print status messages
      -q        report only file names [default: true]
      -r        show all occurrences of the same error
      --help    show this help

    """
    eq(
        docopt(doc, argv: '-v file.py')
        new Dict [
            ['-v', true]
            ['-q', false]
            ['-r', false]
            ['--help', false]
            ['FILE', 'file.py']
            ['INPUT', null]
            ['OUTPUT', null]
        ]
    )

    eq(
        docopt(doc, argv: '-v')
        new Dict [
            ['-v', true]
            ['-q', false]
            ['-r', false]
            ['--help', false]
            ['FILE', null]
            ['INPUT', null]
            ['OUTPUT', null]
        ]
    )

    eq(
        docopt(doc, argv: '-q')
        new Dict [
            ['-v', false]
            ['-q', true]
            ['-r', false]
            ['--help', false]
            ['FILE', null]
            ['INPUT', null]
            ['OUTPUT', null]
        ]
    )

#    with raises(DocoptExit):  # does not match
#        docopt(doc, '-v input.py output.py')
#
#    with raises(DocoptExit):
#        docopt(doc, '--fake')
#
#    with raises(DocoptExit):
#        docopt(doc, '--hel')

    #with raises(SystemExit):
    #    docopt(doc, 'help')  XXX Maybe help command?


test "bug_not_list_argument_if_nothing_matched", ->
    d = 'usage: prog [NAME [NAME ...]]'
    eq(
        docopt(
            d
            argv: 'a b'
        )
        new Dict [
            ['NAME', ['a', 'b']]
        ]
    )
    eq(
        docopt(
            d
            argv: ' '
        )
        new Dict [
            ['NAME', []]
        ]
    )


test "option_arguments_default_to_none", ->
    d = """usage: prog [options]

    -a        Add
    -m <msg>  Message

    """
    eq(
        docopt(
            d
            argv: '-a'
        )
        new Dict [
            ['-m', false]
            ['-a', true]
        ]
    )


test "options_without_description", ->
    eq(docopt('usage: prog --hello', argv: '--hello'),
       new Dict([['--hello', true]]))
    eq(docopt('usage: prog [--hello=<world>]', argv: ''),
       new Dict([['--hello', false]]))  # TODO should be null
    eq(docopt('usage: prog [--hello=<world>]', argv: '--hello wrld'),
       new Dict([['--hello', 'wrld']]))
    eq(docopt('usage: prog [-o]', argv: ''),
       new Dict([['-o', false]]))
    eq(docopt('usage: prog [-o]', argv: '-o'),
       new Dict([['-o', true]]))
    eq(docopt('usage: prog [-opr]', argv: '-op'),
       new Dict([['-o', true], ['-p', true], ['-r', false]]))
    eq(docopt('usage: git [-v | --verbose]', argv: '-v'),
       new Dict([['-v', true], ['--verbose', false]]))
    eq(docopt('usage: git remote [-v | --verbose]', argv: 'remote -v'),
       new Dict([['remote', true], ['-v', true], ['--verbose', false]]))


test 'allow_single_underscore', ->
    eq docopt('usage: prog [-]', argv: '-'), new Dict([['-', true]])
    eq docopt('usage: prog [-]', argv: ''), new Dict([['-', false]])

`}`

teardown()
