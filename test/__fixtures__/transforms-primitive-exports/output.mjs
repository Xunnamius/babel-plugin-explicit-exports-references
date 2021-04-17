function internalfn1() {
  module.exports.fn1();
  void Promise.all([1, 2, 3].map((_) => [module.exports.fn2]).map((a) => a[0]()));
}

export function fn1() {
  global.console.log('hello, world!');
}
export async function fn2() {
  module.exports.fn1();
  internalfn1();
}
export async function fn3() {
  const f = module.exports.fn1;
  await module.exports.fn2();
  f();
  internalfn1();
}
internalfn1();
void module.exports.fn3();
export let var1;
module.exports.var1 = 'hello, world!';
module.exports.var1 = 'goodbye, world!';
export let var2 = 2;
module.exports.var2 = 3;
export let var3, var4;
export let var5, var6;
module.exports.var5 = true;
module.exports.var5 = false;
module.exports.var6 = 6;
module.exports.var6 += 1;
export const var7 = 7,
  var8 = 8;
export function fn4() {
  return module.exports.var7 + var8;
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
    return var10 + module.exports.var6;
  }
}

class Class3 {
  val() {
    return (
      new module.exports.Class1().val() +
      new module.exports.Class2().val() +
      new Class3().life()
    );
  }

  life() {
    return 42;
  }
}

new Class3();
new module.exports.Class2();
