export const myFn = () => Promise.resolve(true);
export default async function () {
  await module.exports.myFn();
}
