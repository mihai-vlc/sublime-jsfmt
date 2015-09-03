"use strict"

var test = require('tape')
var bl = require('bl')

var path = require('path')

var npmRun = require('../')

var level0 = path.join(__dirname, 'fixtures', 'level0')
var level1 = path.join(level0, 'node_modules', 'level1')
var level2 = path.join(level1, 'node_modules', 'level2')

var level = [level0, level1, level2]
var binPath = level.map(function(levelPath) {
  return path.join(levelPath, "node_modules", ".bin")
})

test('spawn', function(t) {
  t.plan(3)
  var child = npmRun.spawn(
    'level1',
    'here are some arguments'.split(' '),
    {cwd: level[0]}
  )
  var stdout = bl(function(err, data) {
    t.equal(data.toString().trim(), 'level1')
  })
  var stderr = bl(function(err, data) {
    t.equal(data.toString().trim(), 'here are some arguments')
  })
  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)
  child.on('close', function(errCode) {
    t.equal(errCode, 0)
  })
})

test('spawn nested', function(t) {
  t.plan(3)
  var child = npmRun.spawn(
    'level1',
    'here are some arguments'.split(' '),
    {cwd: level[1]}
  )
  var stdout = bl(function(err, data) {
    t.equal(data.toString().trim(), 'level1')
  })
  var stderr = bl(function(err, data) {
    t.equal(data.toString().trim(), 'here are some arguments')
  })
  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)
  child.on('close', function(errCode) {
    t.equal(errCode, 0)
  })
})

test('spawn bad command', function(t) {
  var badPath = 'not-exist-adsjk'
  npmRun.spawn(
    badPath,
    'here are some arguments'.split(' '),
    {cwd: level[1]}
  ).on('error', function(err) {
    t.ok(err, 'has error')
    t.equal(err.code, 'ENOENT')
    t.ok(err.message.indexOf(badPath) !== -1)
    t.end()
  })
})
