#!/usr/bin/env coffee

{docopt} = require '../docopt'

doc = ''

process.stdin.resume()
process.stdin.setEncoding 'utf8'
process.stdin.on 'data', (chunk) ->
    doc += chunk

process.stdin.on 'end', ->
    try
        console.log JSON.stringify docopt doc
    catch e
        console.log '"user-error"'
