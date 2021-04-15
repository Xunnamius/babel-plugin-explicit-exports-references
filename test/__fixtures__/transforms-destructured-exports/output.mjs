const o = {
  var1: true,
  var2: false,
  var3: 5
};

const var2 = 2;
export const { var1, var3: var4 } = o;

export function fn1() {
  void var2;
  return o.var1 || o.var2 || module.exports.var1 || module.exports.var4;
}
