let a = 7n;
let b = BigInt(3);
const b1 = BigInt("3");
const b2 = BigInt("0x3");
const b3 = BigInt("0o3");
const BI = BigInt;
const b4 = BI(3);
const b5 = BI(3 + 6);
const b6 = BI(3 + "6");
function z() {
  return 2n;
}
const b7 = z();
const c1 = a + b;
const c2 = a - b;
const c3 = a * b;
const c4 = a / b;
const c5 = a % b;
const c6 = a ** b;
const c7 = -a;
const c8 = ~a;
const c8_1 = !a;
const c9 = a << b;
const c10 = a >> b;
const c11 = a & b;
const c12 = a | b;
const c13 = a ^ b;
const c14 = a === b;
const c14_1 = a !== b;
const c14_2 = a != b;
const c14_3 = a == b;
const c15 = a < b;
const c16 = a > b;
const c17 = a >= b;
const c18 = a <= b;
const c19 = a <= b ? a + b : a - b;
const c20 = a + b * (c1 - c2);
const c20_1 = a + b * c1 - c2;
const c21 = [a++, b--];
let a21_1 = 1;
let b21_1 = 2;
const c21_1 = [a21_1++, b21_1--];
a += b;
a -= b;
a *= b;
a /= b;
a %= b;
a **= b;
a <<= b;
a >>= b;
a &= b;
a |= b;
a ^= b;
a = b;

function foo(a: bigint, b: string | bigint, c: BigInt): bigint | string {
  throw new Error("qqq");
}

foo(a + b, a * b + c1, (a *= b + a));

const d1 = c1 % c2 >= c3 ? c4 + 1n : c4;
