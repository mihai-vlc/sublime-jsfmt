"use strict"

import test from 'tape'
import protochain from './'

test('protochain', t => {
  t.test('finds correct prototype chain', t => {
    let obj = {}
    strictEqualArray(t, protochain(obj), [Object.prototype])
    strictEqualArray(t, protochain(Object.create(obj)), [obj, Object.prototype])
    strictEqualArray(t, protochain(new Error('message')), [Error.prototype, Object.prototype])
    strictEqualArray(t, protochain(new TypeError('message')), [TypeError.prototype, Error.prototype, Object.prototype])
    strictEqualArray(t, protochain(new String()), [String.prototype, Object.prototype])
    strictEqualArray(t, protochain(new Number()), [Number.prototype, Object.prototype])
    strictEqualArray(t, protochain(new RegExp('abc')), [RegExp.prototype, Object.prototype])
    strictEqualArray(t, protochain(new Date()), [Date.prototype, Object.prototype])
    t.end()
  })

  t.test('null prototype is handled correctly', t => {
    let noProtoObject = Object.create(null)
    strictEqualArray(t, protochain(noProtoObject), [])
    strictEqualArray(t, protochain(Object.create(noProtoObject)), [noProtoObject])
    t.end()
  })

  t.test('non-object values cooerce to object counterparts correctly', t => {
    strictEqualArray(t, protochain('abc'), [String.prototype, Object.prototype])
    strictEqualArray(t, protochain(123), [Number.prototype, Object.prototype])
    strictEqualArray(t, protochain(/abc/), [RegExp.prototype, Object.prototype])
    strictEqualArray(t, protochain(true), [Boolean.prototype, Object.prototype])
    strictEqualArray(t, protochain(false), [Boolean.prototype, Object.prototype])
    strictEqualArray(t, protochain(''), [String.prototype, Object.prototype])
    strictEqualArray(t, protochain(0), [Number.prototype, Object.prototype])
    t.end()
  })

  t.test('null values produce empty list', t => {
    strictEqualArray(t, protochain(), [])
    strictEqualArray(t, protochain(undefined), [])
    strictEqualArray(t, protochain(null), [])
    t.end()
  })

  t.test('examples', t => {
    t.test('ES5', t => {
      function Person() {}
      function FancyPerson() {
        Person.call(this)
      }
      FancyPerson.prototype = Object.create(Person.prototype)

      strictEqualArray(t, protochain(new Person()), [Person.prototype, Object.prototype])
      strictEqualArray(t, protochain(new FancyPerson()), [FancyPerson.prototype, Person.prototype, Object.prototype])
      t.end()
    })
    t.test('ES6', t => {
      // note this will in-fact be compiled to ES5
      class Person {}
      strictEqualArray(t, protochain(new Person()), [Person.prototype, Object.prototype])

      class FancyPerson extends Person {}
      strictEqualArray(t, protochain(new FancyPerson()), [FancyPerson.prototype, Person.prototype, Object.prototype])
      t.end()
    })
    t.test('functions', t => {
      class Foo extends Function {}
      class Bar extends Foo {}
      strictEqualArray(t, protochain(new Bar()), [Bar.prototype, Foo.prototype, Function.prototype, Object.prototype])
      t.end()
    })
  })

  // new native types which may not be supported

  if (typeof Symbol !== 'undefined') {
    t.test('symbol support', t => {
      let foo = Symbol('foo')
      strictEqualArray(t, protochain(foo), [Symbol.prototype, Object.prototype])
      t.end()
    })
  }

  if (typeof Promise !== 'undefined') {
    t.test('promise support', t => {
      let foo = new Promise((Y, N) => Y())
      strictEqualArray(t, protochain(foo), [Promise.prototype, Object.prototype])
      t.end()
    })
  }

  t.end()
})

function strictEqualArray(t, a, b) {
  a.forEach((item, index) => t.strictEqual(a[index], b[index], `strictEqual at index ${index}`))
  t.equal(a.length, b.length, 'same length')
}
