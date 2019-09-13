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
    noEmitOnError: true,
    noImplicitAny: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    outDir: tempFolder
  });
  return fs
    .readFileSync(path.join(tempFolder, `${fileBaseName}.js`), "utf-8")
    .trim();
}
export function $(z: TemplateStringsArray) {
  return format(compileToString(z.join("")));
}
export function format(text: string) {
  const result = ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.CommonJS }
  });
  return result.outputText;
}
export function _(z: TemplateStringsArray) {
  return format(z.join(""));
}
