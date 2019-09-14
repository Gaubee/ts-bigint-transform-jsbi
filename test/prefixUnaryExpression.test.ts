import test from "ava";
import { $, _, joinTemplateStringsArray } from "./lib/forTestCompiler";
function my$(codes: TemplateStringsArray, ...args: unknown[]) {
  return $`let a = 3n;${joinTemplateStringsArray(codes, args)}`
    .replace("let a = JSBI.BigInt(3);", "")
    .trim();
}
function my_(codes: TemplateStringsArray, ...args: unknown[]) {
  return _`declare const JSBI:any;let a = JSBI.BigInt(3);${joinTemplateStringsArray(
    codes,
    args
  )}`
    .replace("let a = JSBI.BigInt(3);", "")
    .trim();
}
test("PlusPlusToken ++a", t => {
  t.is(my$`const c = ++a`, my_`const c = a = JSBI.add(a, JSBI.BigInt(1))`);
});
test("MinusMinusToken --a", t => {
  t.is(
    my$`const c = --a`,
    my_`const c = a = JSBI.subtract(a, JSBI.BigInt(1));`
  );
});
test("ExclamationToken !a", t => {
  t.is(my$`const c = !a;`, my_`const c = !JSBI.toNumber(a);`);
});
test("TildeToken ~a", t => {
  t.is(my$`const c = ~a`, my_`const c = JSBI.bitwiseNot(a);`);
});
test("MinusToken -a", t => {
  t.is(my$`const c = -a`, my_`const c = JSBI.unaryMinus(a);`);
});
