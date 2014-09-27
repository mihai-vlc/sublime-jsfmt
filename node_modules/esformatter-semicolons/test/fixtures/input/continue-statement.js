var a = 0;
var b = 8;

c:
while (a < 4) {
  a += 1;

  d:
  while (b > 4) {
    b -= 1;
    if ((b % 2) == 0) {
      continue d // e
    }
  }

  f(a, b);
}
