print = -> console.log [].join.call arguments, ' '

atos = Array.prototype.toString
Array.prototype.toString = -> '[' + atos.call(@) + ']'

class DocoptLanguageError extends Error
    constructor: (@message) ->
        print @message


class DocoptExit extends Error

    constructor: (message) ->
        super message
        print message if message
        process.exit 1


class Pattern

    constructor: (@children=[]) ->

    valueOf: @toString

    toString: ->
        formals = @children.join ', '
        "#{@constructor.name}(#{formals})"

    match: -> throw new Error("""classes inheriting from Pattern
                                 must overload the match method""")

    flat: ->
        if not @hasOwnProperty 'children' then return [@]
        res = []
        res = res.concat child.flat() for child in @children
        res

    fix: ->
        @fix_identities()
        @fix_list_arguments()

    fix_identities: (uniq=null) ->
        """Make pattern-tree tips point to same object if they are equal."""

        if not @hasOwnProperty 'children' then return @
        if uniq is null
            [uniq, flat] = [{}, @flat()]
            uniq[k] = k for k in flat

        i = 0
        enumerate = ([i++, c] for c in @children)
        for [i, c] in enumerate
            if not c.hasOwnProperty 'children'
                @children[i] = uniq[c]
            else
                c.fix_identities uniq
        @

    fix_list_arguments: ->
        """Find arguments that should accumulate values and fix them."""
        either = (c.children for c in @either().children)
        for child in either
            counts = {}
            for c in child
                counts[c] = (counts[c] ? 0) + 1
            e.value = [] for e in child \
                when counts[e] > 1 and e.constructor is Argument
        @

    either: ->
        if not @hasOwnProperty 'children'
            return new Either [new Required [@]]
        else
            ret = []
            groups = [[@]]
            while groups.length
                children = groups.shift()
                [i, indices, types] = [0, {}, {}]
                zip = ([i++, c] for c in children)
                for [i,c] in zip
                    name = c.constructor.name
                    if name not of types
                        types[name] = []
                    types[name].push c
                    if c not of indices
                        indices[c] = i
                if either = types[Either.name]
                    either = either[0]
                    children.splice indices[either], 1
                    for c in either.children
                        group = [c].concat children
                        groups.push group
                else if required = types[Required.name]
                    required = required[0]
                    children.splice indices[required], 1
                    group = required.children.concat children
                    groups.push group
                else if optional = types[Optional.name]
                    optional = optional[0]
                    children.splice indices[optional], 1
                    group = optional.children.concat children
                    groups.push group
                else if oneormore = types[OneOrMore.name]
                    oneormore = oneormore[0]
                    children.splice indices[oneormore], 1
                    group = oneormore.children
                    group = group.concat group, children
                    groups.push group
                else
                    ret.push children
            return new Either(new Required e for e in ret)


class Argument extends Pattern

    constructor: (@argname, @value=null) ->

    name: -> @argname

    toString: -> "Argument(#{@argname}, #{@value})"

    match: (left, collected=[]) ->
        args = (l for l in left when l.constructor is Argument)
        if not args.length then return [false, left, collected]
        left = (l for l in left when l.toString() isnt args[0].toString())
        if @value is null or @value.constructor isnt Array
            collected = collected.concat [new Argument @name(), args[0].value]
            return [true, left, collected]
        same_name = (a for a in collected \
            when a.constructor is Argument and a.name() is @name())
        if same_name.length > 0
            same_name[0].value.push args[0].value
            return [true, left, collected]
        else
            collected = collected.concat [new Argument @name(), [args[0].value]]
            return [true, left, collected]


class Command extends Pattern

    constructor: (@cmdname, @value=false) ->

    name: -> @cmdname

    toString: ->
        "Command(#{@cmdname}, #{@value})"

    match: (left, collected=[]) ->
        args = (l for l in left when l.constructor is Argument)
        if not args.length or args[0].value isnt @name()
            return [false, left, collected]
        left.splice(left.indexOf(args[0]), 1)
        collected.push new Command @name(), true
        [true, left, collected]


class Option extends Pattern

    constructor: (@short=null, @long=null, @argcount=0, @value=false) ->

    toString: -> "Option(#{@short}, #{@long}, #{@argcount}, #{@value})"

    name: -> @long or @short

    @parse: (description) ->
        # strip whitespaces
        description = description.replace(/^\s*|\s*$/g, '')
        # split on first occurence of 2 consecutive spaces ('  ')
        [_, options,
         description] = description.match(/(.*?)  (.*)/) ? [null, description, '']
        # replace ',' or '=' with ' '
        options = options.replace /,|=/g, ' '
        # set some defaults
        [short, long, argcount, value] = [null, null, 0, false]
        for s in options.split /\s+/  # split on spaces
            if s[0..1] is '--'
                long = s
            else if s[0] is '-'
                short = s
            else
                argcount = 1
        if argcount is 1
            matched = /\[default:\s+(.*)\]/.exec(description)
            value = if matched then matched[1] else false
        new Option short, long, argcount, value

    match: (left, collected=[]) ->
        left_ = (l for l in left when (l.constructor isnt Option \
                 or @short isnt l.short or @long isnt l.long))
        [left.join(', ') isnt left_.join(', '), left_, collected]

class AnyOptions extends Pattern

    match: (left, collected=[]) ->
        left_ = (l for l in left when l.constructor isnt Option)
        [left.join(', ') isnt left_.join(', '), left_, collected]


class Required extends Pattern

    match: (left, collected=[]) ->
        l = left #copy(left)
        c = collected #copy(collected)
        for p in @children
            [matched, l, c] = p.match(l, c)
            if not matched
                return [false, left, collected]
        [true, l, c]


class Optional extends Pattern

    match: (left, collected=[]) ->
        #left = copy(left)
        for p in @children
            [m, left, collected] = p.match(left, collected)
        [true, left, collected]


class OneOrMore extends Pattern

    match: (left, collected=[]) ->
        l = left #copy(left)
        c = collected #copy(collected)
        l_ = []
        matched = true
        times = 0
        while matched
            # could it be that something didn't match but changed l or c?
            [matched, l, c] = @children[0].match(l, c)
            times += if matched then 1 else 0
            if l_.join(', ') is l.join(', ') then break
            l_ = l #copy(l)
        if times >= 1 then return [true, l, c]
        [false, left, collected]


class Either extends Pattern

    match: (left, collected=[]) ->
        outcomes = []
        for p in @children
            outcome = p.match(left, collected)
            if outcome[0] then outcomes.push(outcome)
        if outcomes.length > 0
            outcomes.sort((a,b) ->
                if a[1].length > b[1].length
                    1
                else if a[1].length < b[1].length
                    -1
                else
                    0)
            return outcomes[0]
        [false, left, collected]


# same as TokenStream in python
class TokenStream extends Array

    constructor: (source, @error) ->
        stream =
           if source.constructor is String
               source.replace(/^\s+|\s+$/, '').split(/\s+/)
           else
               source
        @push.apply @, stream

    shift: -> [].shift.apply(@) or null

    current: -> @[0] or null

    toString: -> ([].slice.apply @).toString()

    join: (glue) -> ([].join.apply @, glue)


parse_shorts = (tokens, options) ->
    raw = tokens.shift()[1..]
    parsed = []
    while raw.length > 0
        opt = (o for o in options when o.short isnt null and o.short[1] == raw[0])
        if opt.length > 1
            tokens.error "-#{raw[0]} is specified ambiguously #{opt.length} times"
        if opt.length < 1
            if tokens.error is DocoptExit
                throw new tokens.error "-#{raw[0]} is not recognized"
            else
                o = new Option('-' + raw[0], null)
                options.push(o)
                parsed.push(o)
                raw = raw[1..]
                continue
        o = opt[0]
        opt = new Option o.short, o.long, o.argcount, o.value
        raw = raw[1..]
        if opt.argcount == 0
            value = true
        else
            if raw in ['', null]
                if tokens.current() is null
                    throw new tokens.error "-#{opt.short[0]} requires argument"
                raw = tokens.shift()
            [value, raw] = [raw, '']
        opt.value = value
        parsed.push opt
    return parsed


parse_long = (tokens, options) ->
    [_, raw, value] = tokens.current().match(/(.*?)=(.*)/) ? [null,
                                                tokens.current(), '']
    tokens.shift()
    value = if value == '' then null else value
    opt = (o for o in options when o.long and o.long[0...raw.length] == raw)
    if opt.length > 1
        throw new tokens.error "#{raw} is specified ambiguously #{opt.length} times"
    if opt.length < 1
        if tokens.error is DocoptExit
            throw new tokens.error "#{raw} is not recognized"
        else
            o = new Option(null, raw, +!!value)
            options.push(o)
            return [o]
    o = opt[0]
    opt = new Option o.short, o.long, o.argcount, o.value
    if opt.argcount == 1
        if value is null
            if tokens.current() is null
                tokens.error "#{opt.name()} requires argument"
            value = tokens.shift()
    else if value is not null
        tokens.error "#{opt.name()} must not have an argument"
    opt.value = value or true
    [opt]


parse_pattern = (source, options) ->
    tokens = new TokenStream source.replace(/([\[\]\(\)\|]|\.\.\.)/g, ' $1 '),
                         DocoptLanguageError
    result = parse_expr tokens, options
    if tokens.current() is not null
        raise tokens.error 'unexpected ending: ' + tokens.join ' '
    new Required result


parse_expr = (tokens, options) ->
    # expr ::= seq , ( '|' seq )* ;
    seq = parse_seq tokens, options

    if tokens.current() isnt '|'
        return seq

    result = if seq.length > 1 then [new Required seq] else seq
    while tokens.current() is '|'
        tokens.shift()
        seq = parse_seq tokens, options
        result = result.concat if seq.length > 1 then [new Required seq] else seq

    return if result.length > 1 then [new Either result] else result


parse_seq = (tokens, options) ->
    # seq ::= ( atom [ '...' ] )* ;

    result = []
    while tokens.current() not in [null, ']', ')', '|']
        atom = parse_atom tokens, options
        if tokens.current() is '...'
            atom = [new OneOrMore atom]
            tokens.shift()
        result = result.concat atom
    return result


parse_atom = (tokens, options) ->
    # atom ::= '(' expr ')' | '[' expr ']' | '[' 'options' ']' | '--'
    #        | long | shorts | argument | command ;

    token = tokens.current()
    result = []
    if token is '('
        tokens.shift()

        result = [new Required parse_expr tokens, options]
        if tokens.shift() != ')'
            raise tokens.error "Unmatched '('"
        result
    else if token is '['
        tokens.shift()
        if tokens.current() == 'options'
            result = [new Optional [new AnyOptions]]
            tokens.shift()
        else
            result = [new Optional parse_expr tokens, options]
        if tokens.shift() != ']'
            raise tokens.error "Unmatched '['"
        result
    else if token[0..1] is '--'
        if token is '--'
            [new Command tokens.shift()]
        else
            parse_long tokens, options
    else if token[0] is '-' and token isnt '-'
        parse_shorts tokens, options
    else if (token[0] is '<' and
          token[token.length-1] is '>') or /^[^a-z]*[A-Z]+[^a-z]*$/.test(token)
        [new Argument tokens.shift()]
    else
        [new Command tokens.shift()]


parse_args = (source, options) ->
    tokens = new TokenStream source, DocoptExit
    #options = options.slice(0) # shallow copy, not sure if necessary
    opts = []
    while (token = tokens.current()) isnt null
        if token is '--'
            #tokens.shift()
            return opts.concat(new Argument null, tokens.shift() while tokens.length)
        else if token[0...2] is '--'
            long = parse_long tokens, options
            opts = opts.concat long
        else if token[0] is '-' and token isnt '-'
            shorts = parse_shorts tokens, options
            opts = opts.concat shorts
        else
            opts.push new Argument null, tokens.shift()
    return opts

parse_doc_options = (doc) ->
    (Option.parse('-' + s) for s in doc.split(/^ *-|\n *-/)[1..])

printable_usage = (doc, name) ->
    usage_split = doc.split(/(usage:)/i)
    if usage_split.length < 3
        throw new DocoptLanguageError '"usage:" (case-insensitive) not found.'
    else if usage_split.length > 3
        throw new DocoptLanguageError 'More than one "usage:" (case-insensitive).'
    return usage_split[1..].join('').split(/\n\s*\n/)[0].replace(/^\s+|\s+$/, '')

formal_usage = (printable_usage) ->
    pu = printable_usage.split(/\s+/)[1..]  # split and drop "usage:"
    ((if s == pu[0] then '|' else s) for s in pu[1..]).join ' '

extras = (help, version, options, doc) ->
    opts = {}
    opts[opt.name()] = true for opt in options when opt.value
    if help and (opts['--help'] or opts['-h'])
        print doc.replace /^\s*|\s*$/, ''
        process.exit()
    if version and opts['--version']
        print version
        process.exit()

class Dict extends Object

    constructor: (pairs) ->
        (@[key] = value for [key, value] in pairs)

    toString: () ->
        atts = (k for k of @ when k not in ['constructor', 'toString'])
        atts.sort()
        '{' + (k + ': ' + @[k] for k in atts).join(',\n ') + '}'

docopt = (doc, kwargs={}) ->
    allowedargs = ['argv', 'name', 'help', 'version']
    throw new Error "unrecognized argument to docopt: " for arg of kwargs \
        when arg not in allowedargs

    argv    = if kwargs.argv is undefined \
              then process.argv[2..] else kwargs.argv
    name    = if kwargs.name is undefined \
              then null else kwargs.name
    help    = if kwargs.help is undefined \
              then true else kwargs.help
    version = if kwargs.version is undefined \
              then null else kwargs.version

    usage = printable_usage doc, name
    pot_options = parse_doc_options doc
    formal_pattern   = parse_pattern formal_usage(usage), pot_options

    argv = parse_args argv, pot_options
    extras help, version, argv, doc
    [matched, left, argums] = formal_pattern.fix().match argv
    if matched and left.length is 0  # better message if left?
        options = (opt for opt in argv when opt.constructor is Option)
        pot_arguments = (a for a in formal_pattern.flat() \
            when a.constructor in [Argument, Command])
        parameters = [].concat pot_options, options, pot_arguments, argums
        return new Dict([a.name(), a.value] for a in parameters)
    throw new DocoptExit usage

module.exports =
    docopt       : docopt
    Option       : Option
    Argument     : Argument
    Command      : Command
    Required     : Required
    AnyOptions   : AnyOptions
    Either       : Either
    Optional     : Optional
    Pattern      : Pattern
    OneOrMore    : OneOrMore
    TokenStream  : TokenStream
    Dict         : Dict
    formal_usage : formal_usage
    parse_doc_options: parse_doc_options
    parse_pattern: parse_pattern
    parse_long   : parse_long
    parse_shorts : parse_shorts
    parse_args   : parse_args
    printable_usage: printable_usage
