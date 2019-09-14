import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as crypto from "crypto";
import { execSync } from "child_process";
import { CompileFactory } from "../../src";
import * as ts from "typescript";

const compile = CompileFactory({
  verbose: false
});

const tempFolder = path.join(
  os.tmpdir(),
  `ts-bigint-transform-jsbi-test-${Date.now()}-${process.pid}`
);
fs.mkdirSync(tempFolder);
process.on("exit", function() {
  //? execSync(`rm -r -f ${tempFolder}`, { cwd: os.tmpdir() });
});
export function compileToString(code: string) {
  const fileBaseName = crypto
    .createHash("md5")
    .update(code)
    .digest("hex");
  const fileName = `${fileBaseName}.ts`;
  const filePath = path.join(tempFolder, fileName);
  fs.writeFileSync(filePath, code);
  compile([filePath], {
    noEmitOnError: false,
    noImplicitAny: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    outDir: tempFolder
  });
  return fs
    .readFileSync(path.join(tempFolder, `${fileBaseName}.js`), "utf-8")
    .trim();
}
export function joinTemplateStringsArray(z: TemplateStringsArray, args: unknown[]) {
  let res = z[0];
  for (let i = 1; i < z.length; i += 1) {
    res += z[i] + String(args[i - 1]);
  }
  return res;
}
export function $(z: TemplateStringsArray, ...args: unknown[]) {
  return compileToString(joinTemplateStringsArray(z, args));
}
export function format(text: string) {
  const result = ts.transpileModule(text, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ESNext
    }
  });
  return result.outputText;
}
export function _(z: TemplateStringsArray, ...args: unknown[]) {
  return format(joinTemplateStringsArray(z, args)).trim();
}
