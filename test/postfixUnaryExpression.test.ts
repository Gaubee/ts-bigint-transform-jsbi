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
test("PlusPlusToken a++", t => {
  t.is(
    my$`const c = a++`,
    my_`const c = [a, a = JSBI.add(a, JSBI.BigInt(1))][0]`
  );
});

test("PlusPlusToken a--", t => {
  t.is(
    my$`const c = a--`,
    my_`const c = [a, a = JSBI.subtract(a, JSBI.BigInt(1))][0]`
  );
});
