export default function test() {
  const test = 'overshadow';
  void test;
  return 5;
}

export const f = () => test();
export const g = (fn: typeof f) => test() || fn(),
  h = 5;

void f;
void g(f);
void h;
