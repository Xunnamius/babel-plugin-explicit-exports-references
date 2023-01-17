export enum MyEnum {
  A,
  B,
  C
}

export const myFn = (myEnum: MyEnum) => Promise.resolve(myEnum);
export default async function () {
  await myFn(MyEnum.B);
}
