export default function test() {
  return 5;
}

const f = () => test();
void f;
