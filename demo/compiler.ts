import { CompileFactory } from "../src";
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
