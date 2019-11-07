import * as ts from "typescript";
import { TransformerFactory } from "./transformer";
export function CompileFactory(
  opts: {
    JSBI_GLOBAL_SYMBOL_NAME?: string;
    IMPORT_HEADER?: string;
    verbose?: boolean;
  } = {}
) {
  return function compile(
    fileNames: string[],
    options: ts.CompilerOptions,
    host?: ts.CompilerHost,
    oldProgram?: ts.Program,
    configFileParsingDiagnostics?: readonly ts.Diagnostic[]
  ) {
    const program = ts.createProgram(
      fileNames,
      options,
      host,
      oldProgram,
      configFileParsingDiagnostics
    );
    const { transformer, bigintTransformCount } = TransformerFactory(
      program.getTypeChecker(),
      opts
    );
    const emitResult = program.emit(
      undefined,
      (
        fileName: string,
        data: string,
        writeByteOrderMark: boolean,
        onError?: (message: string) => void,
        sourceFiles?: ReadonlyArray<ts.SourceFile>
      ) => {
        if (
          sourceFiles &&
          opts.IMPORT_HEADER &&
          sourceFiles.some(sf => bigintTransformCount.get(sf))
        ) {
          data = opts.IMPORT_HEADER + data;
        }
        ts.sys.writeFile(fileName, data, writeByteOrderMark);
      },
      undefined,
      undefined,
      {
        before: [transformer]
      }
    );

    const allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
        let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
          diagnostic.start!
        );
        let message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          "\n"
        );
        console.log(
          `${diagnostic.file.fileName} (${line + 1},${character +
            1}): ${message}`
        );
      } else {
        console.log(
          `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
        );
      }
    });

    // let exitCode = emitResult.emitSkipped ? 1 : 0;
    // console.log(`Process exiting with code '${exitCode}'.`);
    // process.exit(exitCode);
    return emitResult;
  };
}

// compile(process.argv.slice(2), {
//   noEmitOnError: true,
//   noImplicitAny: true,
//   target: ts.ScriptTarget.ESNext,
//   module: ts.ModuleKind.CommonJS,
//   outDir: "./build"
// });
