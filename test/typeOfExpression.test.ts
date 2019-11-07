import test from "ava";
import { $, _, joinTemplateStringsArray } from "./lib/forTestCompiler";
function my$(codes: TemplateStringsArray, ...args: unknown[]) {
  return $`let a = 3n;let b:any = 1;${joinTemplateStringsArray(codes, args)}`
    .replace("let a = JSBI.BigInt(3);", "")
    .replace("let b = 1;", "")
    .trim();
}
function my_(codes: TemplateStringsArray, ...args: unknown[]) {
  return _`declare const JSBI:any;let a = JSBI.BigInt(3);let b:any = 1;${joinTemplateStringsArray(
    codes,
    args
  )}`
    .replace("let a = JSBI.BigInt(3);", "")
    .replace("let b = 1;", "")
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
  t.is(my$`typeof a == "function";`, my_`typeof a == "function";`);
  t.is(my$`typeof b == "string";`, my_`typeof b == "string";`);
  t.is(my$`typeof b == "number";`, my_`typeof b == "number";`);
  t.is(my$`typeof b == "boolean";`, my_`typeof b == "boolean";`);
  t.is(my$`typeof b == "function";`, my_`typeof b == "function";`);
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
