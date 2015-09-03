"use strict"

var npmPath = require('npm-path')
var spawn = require('child_process').spawn
var serializerr = require('serializerr')

var args = process.argv.slice(2)

args = args.map(function(arg) {
  try {
    return JSON.parse(arg)
  } catch(e) {
    return arg
  }
})

var options = {}

args = args.map(function(arg) {
  if (arg.toString() !== '[object Object]') return arg
  options = arg
  return arg
})

npmPath.set({cwd: options.cwd, env: process.env}, function(err) {
  options.stdio = 'inherit'
  spawn.apply(null, args)
  .once('error', function(err) {
    if (err.code === 'ENOENT') {
      err.cmd = args.slice(0, -1).join(' ')
      err.message = 'Invalid npm-run command: ' + err.cmd
    }
    process.send(serializerr(err))
  })
  .on('close', function(code) {
    process.exit(code)
  })
})
