const o = {
  var1: true,
  var2: false,
  var3: 5
};
const var2 = 2;
export const { var1, var3: var4, ...daRest } = o;
export function fn1() {
  void var2;
  void o.var1 || o.var2;
  return module.exports.var1 || module.exports.var4 || module.exports.fn1;
}
void module.exports.daRest;
