function a() {
  return '1'
}

function b() {
  return '2 \
3'
}

function c() {
  return d()
    .e(function() {
      return '4' // f
    })
}

function g() {
  return function() {
    return h()
      .i(function() {
        return function() {
          return '5 \
6' // j

        }
      }) // k
  } /* l
m */

}

function n() {
  if (o) return
  if (p) return // q
  if (r) return /* s
t */

}
