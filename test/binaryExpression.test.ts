import test from "ava";
import { $, _, joinTemplateStringsArray } from "./lib/forTestCompiler";

function my$(codes: TemplateStringsArray, ...args: unknown[]) {
  return $`let a = 7n;let b = BigInt(3);${joinTemplateStringsArray(
    codes,
    args
  )}`
    .replace("let a = JSBI.BigInt(7);", "")
    .replace("let b = BigInt(3);", "")
    .trim();
}
function my_(codes: TemplateStringsArray, ...args: unknown[]) {
  return _`declare const JSBI:any;let a = JSBI.BigInt(7);let b = BigInt(3);${joinTemplateStringsArray(
    codes,
    args
  )}`
    .replace("let a = JSBI.BigInt(7);", "")
    .replace("let b = BigInt(3);", "")
    .trim();
}
test("PlusToken:+", t => {
  t.is(my$`const c1 = a + b;`, my_`const c1 = JSBI.add(a, b);`);
});
test("MinusToken:-", t => {
  t.is(my$`const c2 = a - b;`, my_`const c2 = JSBI.subtract(a, b);`);
});
test("AsteriskToken:*", t => {
  t.is(my$`const c3 = a * b;`, my_`const c3 = JSBI.multiply(a, b);`);
});
test("SlashToken:/", t => {
  t.is(my$`const c4 = a / b;`, my_`const c4 = JSBI.divide(a, b);`);
});
test("PercentToken:%", t => {
  t.is(my$`const c5 = a % b;`, my_`const c5 = JSBI.remainder(a, b);`);
});
test("AsteriskAsteriskToken:**", t => {
  t.is(my$`const c6 = a ** b;`, my_`const c6 = JSBI.exponentiate(a, b);`);
});
test("LessThanLessThanToken:<<", t => {
  t.is(my$`const c9 = a << b;`, my_`const c9 = JSBI.leftShift(a, b);`);
});
test("GreaterThanGreaterThanToken:>>", t => {
  t.is(my$`const c10 = a >> b;`, my_`const c10 = JSBI.signedRightShift(a, b);`);
});
test("AmpersandToken:&", t => {
  t.is(my$`const c11 = a & b;`, my_`const c11 = JSBI.bitwiseAnd(a, b);`);
});
test("BarToken:|", t => {
  t.is(my$`const c12 = a | b;`, my_`const c12 = JSBI.bitwiseOr(a, b);`);
});
test("CaretToken:^", t => {
  t.is(my$`const c13 = a ^ b;`, my_`const c13 = JSBI.bitwiseXor(a, b);`);
});
test("EqualsEqualsEqualsToken:===", t => {
  t.is(my$`const c14 = a === b;`, my_`const c14 = JSBI.equal(a, b);`);
});
test("EqualsEqualsToken:==", t => {
  t.is(my$`const c14_3 = a == b;`, my_`const c14_3 = JSBI.EQ(a, b);`);
});
test("ExclamationEqualsEqualsToken:!==", t => {
  t.is(my$`const c14_1 = a !== b;`, my_`const c14_1 = JSBI.notEqual(a, b);`);
});
test("ExclamationEqualsToken:!=", t => {
  t.is(my$`const c14_2 = a != b;`, my_`const c14_2 = JSBI.NE(a, b);`);
});
test("LessThanToken:<", t => {
  t.is(my$`const c15 = a < b;`, my_`const c15 = JSBI.lessThan(a, b);`);
});
test("LessThanEqualsToken:<=", t => {
  t.is(my$`const c18 = a <= b;`, my_`const c18 = JSBI.lessThanOrEqual(a, b);`);
});
test("GreaterThanToken:>", t => {
  t.is(my$`const c16 = a > b;`, my_`const c16 = JSBI.greaterThan(a, b);`);
});
test("GreaterThanEqualsToken:>=", t => {
  t.is(
    my$`const c17 = a >= b;`,
    my_`const c17 = JSBI.greaterThanOrEqual(a, b);`
  );
});
test("PlusEqualsToken: +=", t => {
  t.is(my$`a += b;`, my_`a = JSBI.add(a, b);`);
});
test("MinusEqualsToken: -=", t => {
  t.is(my$`a -= b;`, my_`a = JSBI.subtract(a, b);`);
});
test("AsteriskEqualsToken: *=", t => {
  t.is(my$`a *= b;`, my_`a = JSBI.multiply(a, b);`);
});
test("SlashEqualsToken: /=", t => {
  t.is(my$`a /= b;`, my_`a = JSBI.divide(a, b);`);
});
test("PercentEqualsToken: %=", t => {
  t.is(my$`a %= b;`, my_`a = JSBI.remainder(a, b);`);
});
test("AsteriskAsteriskEqualsToken: **=", t => {
  t.is(my$`a **= b;`, my_`a = JSBI.exponentiate(a, b);`);
});
test("LessThanLessThanEqualsToken: <<=", t => {
  t.is(my$`a <<= b;`, my_`a = JSBI.leftShift(a, b);`);
});
test("GreaterThanGreaterThanEqualsToken: >>=", t => {
  t.is(my$`a >>= b;`, my_`a = JSBI.signedRightShift(a, b);`);
});
test("AmpersandEqualsToken: &=", t => {
  t.is(my$`a &= b;`, my_`a = JSBI.bitwiseAnd(a, b);`);
});
test("BarEqualsToken: |=", t => {
  t.is(my$`a |= b;`, my_`a = JSBI.bitwiseOr(a, b);`);
});
test("CaretEqualsToken: ^=", t => {
  t.is(my$`a ^= b;`, my_`a = JSBI.bitwiseXor(a, b);`);
});

function mix$(codes: TemplateStringsArray, ...args: unknown[]) {
  return $`let a = 7n;let b = 3;${joinTemplateStringsArray(codes, args)}`
    .replace("let a = JSBI.BigInt(7);", "")
    .replace("let b = 3;", "")
    .trim();
}
function mix_(codes: TemplateStringsArray, ...args: unknown[]) {
  return _`declare const JSBI:any;let a = BigInt(7);let b = 3;${joinTemplateStringsArray(
    codes,
    args
  )}`
    .replace("let a = BigInt(7);", "")
    .replace("let b = 3;", "")
    .trim();
}
test("MixType:EqualsEqualsToken==", t => {
  t.is(mix$`a==b`, mix_`JSBI.EQ(a,b)`);
});
test("MixType:ExclamationEqualsToken !=", t => {
  t.is(mix$`a!=b`, mix_`JSBI.NE(a,b)`);
});
test("MixType:LessThanToken<", t => {
  t.is(mix$`a<b`, mix_`JSBI.LT(a,b)`);
});
test("MixType:LessThanEqualsToken<=", t => {
  t.is(mix$`a<=b`, mix_`JSBI.LE(a,b)`);
});
test("MixType:GreaterThanToken>", t => {
  t.is(mix$`a>b`, mix_`JSBI.GT(a,b)`);
});
test("MixType:GreaterThanEqualsToken>=", t => {
  t.is(mix$`a>=b`, mix_`JSBI.GE(a,b)`);
});
test("MixType:PlusToken+", t => {
  t.is(mix$`a+b`, mix_`JSBI.ADD(a,b)`);
});
