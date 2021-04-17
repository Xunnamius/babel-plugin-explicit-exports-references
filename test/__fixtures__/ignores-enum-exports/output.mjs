export let MyEnum;

(function (MyEnum) {
  MyEnum[(MyEnum['A'] = 0)] = 'A';
  MyEnum[(MyEnum['B'] = 1)] = 'B';
  MyEnum[(MyEnum['C'] = 2)] = 'C';
})(MyEnum || (MyEnum = {}));

export const myFn = (e) => Promise.resolve(e);
export default async function () {
  await module.exports.myFn(MyEnum.B);
}
