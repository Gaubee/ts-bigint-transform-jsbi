import "./bigint";
console.log("QAQ");
const JSBI = {
  zz: (a: number, b: number) => a + b,
  BI: (init: number) => init
};

let z = 0;
z = JSBI.zz(z, JSBI.BI(2));

[z, (z = z + 1)][0];
