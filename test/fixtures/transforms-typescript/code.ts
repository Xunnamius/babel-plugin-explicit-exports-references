export type MyFunction = () => Promise<boolean>;
export const myFn: MyFunction = () => Promise.resolve(true);
export default async function () {
  await (myFn as MyFunction)();
}
