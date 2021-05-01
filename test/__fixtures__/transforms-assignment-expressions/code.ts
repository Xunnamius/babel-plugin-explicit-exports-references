function internalfn1() {
  fn1();
  void Promise.all([1].map((_) => [fn2]).map((a) => a[0]()));
}

export function fn1() {
  global.console.log('hello, world!');
}

export async function fn2() {
  fn1();
  internalfn1();
}

export async function fn3() {
  const f = fn1;
  await fn2();
  f();
  internalfn1();
}

internalfn1();
void fn3();

export let var1: string;
var1 = 'hello, world!';
var1 = 'goodbye, world!';
export let var2 = 2;
var2 = 3;
export let var3: boolean, var4: boolean;
export let var5: boolean | string, var6: number;
var5 = true;
var5 = var1;
var6 = 6;
var6 = var2;

export const var7 = 7,
  var8 = 8;
export function fn4() {
  return var7 + var8;
}

let var9 = 9;
var9 += 1;
const var10 = var9;

export class Class1 {
  val() {
    return var9;
  }
}

export class Class2 {
  val() {
    return var10 + var6;
  }
}

class Class3 {
  val() {
    return new Class1().val() + new Class2().val() + new Class3().life();
  }

  life() {
    return 42;
  }
}

new Class3();
new Class2();
