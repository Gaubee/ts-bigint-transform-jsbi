import "./bigint";
console.log("QAQ");
const JSBI = {
  zz: (a: number, b: number) => a + b,
  BI: (init: number) => init
};

let z = 0;
z = JSBI.zz(z, JSBI.BI(2));

[z, (z = z + 1)][0];

typeof z === "bigint";
typeof z !== "bigint";
typeof z == "bigint";
typeof z != "bigint";
// z instanceof JSBI ===
typeof z === "object";
typeof z !== "object";
typeof z == "object";
typeof z != "object";
typeof z != "str" + "ing";
typeof z > "bigint";
// (z instanceof JSBI?'bigint':typeof z) ===
typeof z == "string";
// typeof z ==

!((z as any) instanceof Number);