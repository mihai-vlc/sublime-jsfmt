import { named1 as myNamed1, named2 } from 'src/mylib'
import * as mylib from 'src/mylib'
import 'src/mylib'

export var myVar1 = 123
export let myVar2 = 'foo'
export const MY_CONST = 'BAR'

export function myFunc() {
  return 'myfunc'
}

export function* myGeneratorFunc() {
  return yield someStuff()
}
export class MyClass {
  constructor() {
    this.name = 'exports test'
  }
}

export default 123
export default function (x) {
  return x
}
export default x => x
export default class {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

export * from 'src/other_module'
export { foo, bar } from 'src/other_module'
export { foo as myFoo, bar } from 'src/other_module'
