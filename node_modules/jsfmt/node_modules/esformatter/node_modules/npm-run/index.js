"use strict"

var npmPath = require('npm-path')
var child_process = require('child_process')
var syncExec = require('sync-exec')

var exec = child_process.exec

// polyfill for child_process.execSync
var execSync = child_process.execSync || function(args, path) {
  return syncExec(args, path).stdout
}

var execFile = child_process.execFile
var spawn = child_process.spawn
var fork = child_process.fork
npmExec.spawn = npmSpawn
npmExec.sync = npmExecSync

module.exports = npmExec

function npmExec(args, options, fn) {
  var opts = setOptions(options, fn)
  options = opts[0]
  fn = opts[1]
  getPath(options, function(err, options) {
    if (err) return fn(err)
    exec(args, options, fn)
  })
}

function npmExecSync(args, options) {
  var opts = setOptions(options)
  var path = getPath.sync(opts[0])
  return execSync(args, path).toString()
}

function npmSpawn() {
  var options = {}
  var args = [].slice.apply(arguments)
  // encode args to pass to spawn.js
  args = args.map(function(arg) {
    if (Array.isArray(arg)) return JSON.stringify(arg)
    if (arg.toString() === '[object Object]') {
      options = arg
      return JSON.stringify(arg)
    }
    return arg
  })
  if (options.stdio === 'inherit') options.silent = false
  else options.silent = true
  var child = fork(__dirname + '/spawn.js', args, options)
  child.on('message', function(jsonErr) {
    var err = new Error()
    Object.keys(jsonErr).forEach(function(key) {
      err[key] = jsonErr[key]
    })
    this.emit('error', err)
  })
  return child
}


function getPath(options, fn) {
  npmPath.get(options, function(err, newPath) {
    var env = Object.create(options.env)
    env[npmPath.PATH] = newPath
    options.env = env
    fn(null, options)
  })
}

getPath.sync = function getPathSync(options) {
  var newPath = npmPath.getSync(options)
  var env = Object.create(options.env)
  env[npmPath.PATH] = newPath
  options.env = env
  return options
}

function setOptions(options, fn) {
  if (typeof options == 'function') fn = options, options = null
  options = Object.create(options || {})
  options.env = options.env || process.env
  options.cwd = options.cwd || process.cwd()
  return [options, fn]
}
