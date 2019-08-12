# ts-bigint-transform-jsbi

## How To Use

```ts
import { CompileFactory } from "ts-bigint-transform-jsbi";
import * as ts from "typescript";

const compile = CompileFactory({
  IMPORT_HEADER: `const JSBI = require('jsbi');\nconst BigInt = JSBI.BigInt;\n`
});
compile(process.argv.slice(2), {
  noEmitOnError: true,
  noImplicitAny: true,
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.CommonJS,
  outDir: "./build"
});
```

## Custom Compile

you can get an `transformer` to transform code when emit program.
and get the transform count in every source file.

```ts
import { TransformerFactory } from "ts-bigint-transform-jsbi";
const { transformer, bigintTransformCount } = TransformerFactory(
  (<ts.Program>program).getTypeChecker(),
  { JSBI_GLOBAL_SYMBOL_NAME: "JSBI" }
);

const c: WeakMap<ts.SourceFile, number> = bigintTransformCount;
const t: ts.TransformerFactory<ts.SourceFile> = transformer;
```
