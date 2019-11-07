// let a = 7n;
// let b = BigInt(3);
// const b1 = BigInt("3");
// const b2 = BigInt("0x3");
// const b3 = BigInt("0o3");
// const BI = BigInt;
// const b4 = BI(3);
// const b5 = BI(3 + 6);
// const b6 = BI(3 + "6");
// function z() {
//   return 2n;
// }
// const b7 = z();
// const c1 = a + b;
// const c2 = a - b;
// const c3 = a * b;
// const c4 = a / b;
// const c5 = a % b;
// const c6 = a ** b;
// const c7 = -a;
// const c8 = ~a;
// const c8_1 = !a;
// const c9 = a << b;
// const c10 = a >> b;
// const c11 = a & b;
// const c12 = a | b;
// const c13 = a ^ b;
// const c14 = a === b;
// const c14_1 = a !== b;
// const c14_2 = a != b;
// const c14_3 = a == b;
// const c15 = a < b;
// const c16 = a > b;
// const c17 = a >= b;
// const c18 = a <= b;
// const c19 = a <= b ? a + b : a - b;
// const c20 = a + b * (c1 - c2);
// const c20_1 = a + b * c1 - c2;
// const c21 = [a++, b--];
// let a21_1 = 1;
// let b21_1 = 2;
// const c21_1 = [a21_1++, b21_1--];
// a += b;
// a -= b;
// a *= b;
// a /= b;
// a %= b;
// a **= b;
// a <<= b;
// a >>= b;
// a &= b;
// a |= b;
// a ^= b;
// a = b;
// /**
//  * @TODO 修复模糊类型
//  * 应该使用ADD
//  *
//  */
// let c22: number | bigint = 1;
// ++c22;
// --c22;
// c22++;
// c22--;
// c22 = 1n;
// ++c22;
// --c22;
// c22++;
// c22--;
// let c22_1: number = 1;
// ++c22_1;
// --c22_1;
// c22_1++;
// c22_1--;
// let c22_2 = Math.random() > 0.5 ? 1n : 1;
// ++c22_2; // c22_2 instanceof JSBI?JSBI.add(...);++c22_2
// --c22_2;
// c22_2++; // c22_2 instanceof JSBI?[c22, c22 = JSBI.ADD(c22, JSBI.BigInt(1))][0];++c22_2
// c22_2--;
// typeof c22_2 === "bigint" ? (c22_2 += 1n) : (c22_2 += 2); // c22_2 instanceof JSBI ? (c22_2 = JSBI.add(c22_2, JSBI.BigInt(1))) : (c22_2 += 2);
// typeof c22_2 === "number" ? (c22_2 += 2) : (c22_2 += 1n); // typeof c22_2 === "number" ? (c22_2 += 2) : (c22_2 = JSBI.add(c22_2, JSBI.BigInt(1)));

// function foo(a: bigint, b: string | bigint, c: BigInt): bigint | string {
//   return `${a},${c},${b}`;
// }
// const f1 = foo(a + b, a * b + c1, (a *= b + a));

// const d1 = c1 % c2 >= c3 ? c4 + 1n : c4;

var _a: any;
var T: any;
[
  typeof (_a = typeof T !== "undefined" && T) === "function" ? _a : Object,
  Object
];
