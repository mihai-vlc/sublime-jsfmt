a()
b(function() {
  d()
    .e()
    .f()
})

g() // 1
h(function() {
  i()
    .j() // 2
}) /* 3
4 */

k() /* 5
6 */ l() // 7
