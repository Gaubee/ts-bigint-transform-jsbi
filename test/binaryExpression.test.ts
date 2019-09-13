import test from "ava";
import { $, _ } from "./lib/forTestCompiler";
test("BinaryExpression", t => {
  t.is($`let a = 7n;`, _`let a = JSBI.BigInt(7);`);
  t.is($`let b = BigInt(3);`, _`let b = BigInt(3);`);
  t.is($`const b1 = BigInt("3");`, _`const b1 = BigInt("3");`);
  t.is($`const b2 = BigInt("0x3");`, _`const b2 = BigInt("0x3");`);
  t.is($`const b3 = BigInt("0o3");`, _`const b3 = BigInt("0o3");`);
  t.is(
    $`const BI = BigInt;const b4 = BI(3);const b5 = BI(3 + 6);const b6 = BI(3 + "6");`,
    _`const BI = BigInt;const b4 = BI(3);const b5 = BI(3 + 6);const b6 = BI(3 + "6");`
  );
});
