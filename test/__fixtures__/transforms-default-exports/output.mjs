export default function test() {
  return 5;
}

const f = () => module.exports.test();
void f;
