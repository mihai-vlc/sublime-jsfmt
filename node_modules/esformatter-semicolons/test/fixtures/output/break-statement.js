a:
for (var b = 0; b < 3; b++) {
  c:
  for (var d = 0; d < 3; d++) {
    if (b == 1 && d == 1) {
      break a; // e
    }
    f(b, d);
  }
  if (b == 2) {
    break;
  }
}

for (;;) {
}
