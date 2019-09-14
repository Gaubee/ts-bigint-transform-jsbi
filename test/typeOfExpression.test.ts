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
test("Direct mode 直接模式", t => {
  t.is(my$`typeof a === "bigint";`, my_`a instanceof JSBI;`);
  t.is(my$`typeof a !== "bigint";`, my_`!(a instanceof JSBI);`);
  t.is(my$`typeof a == "bigint";`, my_`a instanceof JSBI;`);
  t.is(my$`typeof a != "bigint";`, my_`!(a instanceof JSBI);`);
});
test("Compatibility mode 兼容模式", t => {
  t.is(my$`typeof a == "string";`, my_`typeof a == "string";`);
  t.is(my$`typeof a == "number";`, my_`typeof a == "number";`);
  t.is(my$`typeof a == "boolean";`, my_`typeof a == "boolean";`);
});
test("General mode 通用模式", t => {
  t.is(
    my$`typeof a != "str" + "ing";`,
    my_`(a instanceof JSBI ? "bigint" : typeof a) != "str" + "ing";`
  );
  t.is(
    my$`typeof a > "bigint";`,
    my_`(a instanceof JSBI ? "bigint" : typeof a) > "bigint";`
  );
  t.is(
    my$`typeof a === "object";`,
    my_`(a instanceof JSBI ? "bigint" : typeof a) === "object";`
  );
  t.is(
    my$`typeof a !== "object";`,
    my_`(a instanceof JSBI ? "bigint" : typeof a) !== "object";`
  );
  t.is(
    my$`typeof a == "object";`,
    my_`(a instanceof JSBI ? "bigint" : typeof a) == "object";`
  );
  t.is(
    my$`typeof a != "object";`,
    my_`(a instanceof JSBI ? "bigint" : typeof a) != "object";`
  );
});
