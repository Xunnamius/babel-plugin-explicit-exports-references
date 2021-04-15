function internalfn1() {
  // ...
}

export function fn1() {
  global.console.log('hello, world!');
}

export async function fn2() {
  module.exports.fn1();
  internalfn1();
}

export async function fn3() {
  module.exports.fn1();
  await module.exports.fn2();
  internalfn1();
}

internalfn1();
void module.exports.fn3();
