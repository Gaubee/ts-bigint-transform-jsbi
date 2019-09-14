import test from "ava";
import { $, _ } from "./lib/forTestCompiler";
test("BigIntLiteral", t => {
  t.is($`let a = 7n;`, `let a = JSBI.BigInt(7);`);
  t.is($`let b = BigInt(3);`, `let b = BigInt(3);`);
  t.is($`const b1 = BigInt("3");`, `const b1 = BigInt("3");`);
  t.is($`const b2 = BigInt("0x3");`, `const b2 = BigInt("0x3");`);
  t.is($`const b3 = BigInt("0o3");`, `const b3 = BigInt("0o3");`);
  t.is(
    $`const BI = BigInt;const b4 = BI(3);const b5 = BI(3 + 6);const b6 = BI(3 + "6");`,
    _`const BI = BigInt;const b4 = BI(3);const b5 = BI(3 + 6);const b6 = BI(3 + "6");`
  );
  t.is(
    $`function z() { return 2n; } const b7 = z();`,
    _`function z() { return JSBI.BigInt(2); } const b7 = z();`
  );
});
