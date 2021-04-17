export enum MyEnum {
  A,
  B,
  C
}

export const myFn = (e: MyEnum) => Promise.resolve(e);
export default async function () {
  await myFn(MyEnum.B);
}
