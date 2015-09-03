"use strict"

import test from 'tape'
import serializerr from './'

test('with Errors', t => {
  let err = new Error('message')
  t.ok(err.stack, 'has stack')
  let errObj = serializerr(err)
  let jsonError = JSONify(errObj)
  t.ok(jsonError.name, 'has name')
  t.ok(jsonError.message, 'has message')
  t.ok(jsonError.stack, 'has stack')
  t.end()
})

test('regular objects', t => {
  var obj = {ok: {}}
  let result = serializerr(obj)
  t.deepEqual(obj, result)
  t.equal(result.ok, obj.ok)
  t.end()
})

test('object with no prototype', t => {
  var obj = Object.create(null)
  obj.ok = {}
  let result = serializerr(obj)
  t.deepEqual(obj, result)
  t.equal(result.ok, obj.ok)
  t.end()
})

test('example', t => {
  let error = new Error('an error occurred')

  t.test('without serializerr', t => {
    let poorlySerializedError = JSON.parse(JSON.stringify(error))
    t.equal(poorlySerializedError.name, undefined, 'name is undefined')
    t.equal(poorlySerializedError.message, undefined, 'message is undefined')
    t.equal(poorlySerializedError.stack, undefined, 'stack is undefined')
    t.end()
  })

  t.test('with serializerr', t => {
    let errorObject = serializerr(error)
    let wellSerializedError = JSON.parse(JSON.stringify(errorObject))
    t.equal(wellSerializedError.name, error.name, 'has correct name')
    t.equal(wellSerializedError.message, error.message, 'has correct message')
    t.equal(wellSerializedError.stack, error.stack, 'has correct stack')
    t.end()
  })
  t.end()
})

function JSONify(item) {
  return JSON.parse(JSON.stringify(item))
}
