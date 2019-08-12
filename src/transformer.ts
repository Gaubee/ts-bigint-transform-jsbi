import * as ts from "typescript";

const binaryKindToFunctionName = new Map([
  [ts.SyntaxKind.PlusToken, "add"], //"+"
  [ts.SyntaxKind.MinusToken, "subtract"], // "-"
  [ts.SyntaxKind.AsteriskToken, "multiply"], // "*"
  [ts.SyntaxKind.SlashToken, "divide"], // "/"
  [ts.SyntaxKind.PercentToken, "remainder"], // "%"
  [ts.SyntaxKind.AsteriskAsteriskToken, "exponentiate"], // "**"
  [ts.SyntaxKind.LessThanLessThanToken, "leftShift"], // "<<"
  [ts.SyntaxKind.GreaterThanGreaterThanToken, "signedRightShift"], // ">>"
  [ts.SyntaxKind.AmpersandToken, "bitwiseAnd"], // "&"
  [ts.SyntaxKind.BarToken, "bitwiseOr"], // "|"
  [ts.SyntaxKind.CaretToken, "bitwiseXor"], // "^"
  [ts.SyntaxKind.EqualsEqualsEqualsToken, "equal"], // "==="
  [ts.SyntaxKind.EqualsEqualsToken, "EQ"], //"=="
  [ts.SyntaxKind.LessThanToken, "LT"], //"<"
  [ts.SyntaxKind.LessThanEqualsToken, "LE"], //"<="
  [ts.SyntaxKind.GreaterThanToken, "GT"], //">"
  [ts.SyntaxKind.GreaterThanEqualsToken, "GE"] //">="
]);
const binaryWithEqualKindToFunctionName = new Map([
  [ts.SyntaxKind.PlusEqualsToken, "add"], //"+="
  [ts.SyntaxKind.MinusEqualsToken, "subtract"], // "-="
  [ts.SyntaxKind.AsteriskEqualsToken, "multiply"], // "*="
  [ts.SyntaxKind.SlashEqualsToken, "divide"], // "/="
  [ts.SyntaxKind.PercentEqualsToken, "remainder"], // "%="
  [ts.SyntaxKind.AsteriskAsteriskEqualsToken, "exponentiate"], // "**="
  [ts.SyntaxKind.LessThanLessThanEqualsToken, "leftShift"], // "<<="
  [ts.SyntaxKind.GreaterThanGreaterThanEqualsToken, "signedRightShift"], // ">>="
  [ts.SyntaxKind.AmpersandEqualsToken, "bitwiseAnd"], // "&="
  [ts.SyntaxKind.BarEqualsToken, "bitwiseOr"], // "|="
  [ts.SyntaxKind.CaretEqualsToken, "bitwiseXor"] // "^="
]);

/**
 *
 * @param typeChecker
 * @param JSBI JSBI GLOBAL SYMBOL NAME
 */
export function TransformerFactory(
  typeChecker: ts.TypeChecker,
  opts: { JSBI_GLOBAL_SYMBOL_NAME?: string }
) {
  const { JSBI_GLOBAL_SYMBOL_NAME: BI = "JSBI" } = opts;

  function createJSBIBigIntLiteral(
    // typeArguments?: ts.TypeNode[],
    argumentsArray?: ts.Expression[]
  ) {
    return ts.createCall(
      ts.createPropertyAccess(ts.createIdentifier(BI), "BigInt"),
      undefined,
      argumentsArray
    );
  }
  const bigintTransformCount = new WeakMap<ts.SourceFile, number>();
  return {
    bigintTransformCount,
    transformer(ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
      return (sf: ts.SourceFile) => {
        let visitorInOutCount = 0;
        const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
          visitorInOutCount += 1;
          /**
           * 值的声明
           */
          if (ts.isBigIntLiteral(node)) {
            const text = node.getText();
            const stringLiteral = ts.createStringLiteral(
              text.substr(0, text.length - 1)
            );
            return createJSBIBigIntLiteral(
              // [ts.createLiteralTypeNode(stringLiteral)],
              [ts.createLiteral(stringLiteral)]
            );
            // ts.createProgram;
            // return ts.createIdentifier(
            //   `${BI}.BigInt('${text.substr(0, text.length - 1)}')`
            // );
          }
          /**
         * 没必要转换`BigInt(xxx)`，因为是直接调用BigInt函数的，只要在全局替换了BigInt函数就行了
         * 反而可能因为一个函数的返回值是BigInt，但本身不是BigInt这个全局的构造函数而误判定
         * 比如:
         * ```ts
         * const a = ()=>1n;
         * const b = a();
         * ```
         * 会被转成
         * ```js
         * const a = ()=>JSBI.BigInt('1');
         * const b = JSBI.BigInt();
         * ```
         if (ts.isCallExpression(node)) {
          const type = typeChecker.getTypeAtLocation(node.expression);
          if (
            type.getCallSignatures().find(signature => {
              return signature.getReturnType().flags === ts.TypeFlags.BigInt;
            })
          ) {
            return ts.createIdentifier(
              `JSBI.BigInt(${node.arguments.map(arg => arg.getText()).join(",")})`
            );
          }
        }
         */
          /**
           * 二元运算符
           */
          if (ts.isBinaryExpression(node)) {
            const leftType = typeChecker.getTypeAtLocation(node.left);
            const rightType = typeChecker.getTypeAtLocation(node.right);
            node.operatorToken;
            ts.SyntaxKind.PlusToken;
            const jsbiFunctionName = binaryKindToFunctionName.get(
              node.operatorToken.kind
            );
            /**
             * 1n + 1n
             * 无赋值的二元符号操作，左右两边必须都是bigint
             * 否则应该随着默认的类型转换来进行
             */
            if (jsbiFunctionName) {
              if (
                [leftType, rightType].every(type => {
                  return type.flags === ts.TypeFlags.BigInt;
                })
              ) {
                return ts.createIdentifier(
                  `${BI}.${jsbiFunctionName}(${node.left.getText()},${node.right.getText()})`
                );
              }
            }
            const jsbiFunctionWithEqualsName = binaryWithEqualKindToFunctionName.get(
              node.operatorToken.kind
            );
            /**
             * a += 1n
             * 有赋值的二元符号操作，左右两边必须都是bigint
             * 否则应该随着默认的类型转换来进行
             */
            if (jsbiFunctionWithEqualsName) {
              if (
                [leftType, rightType].every(type => {
                  return type.flags === ts.TypeFlags.BigInt;
                })
              ) {
                const left = node.left.getText();
                return ts.createIdentifier(
                  `${left}=${BI}.${jsbiFunctionWithEqualsName}(${left},${node.right.getText()})`
                );
              }
            }
          }
          /**
           * 前置运算符
           */
          if (ts.isPrefixUnaryExpression(node)) {
            const operand = node.operand.getText();
            switch (node.operator) {
              case ts.SyntaxKind.PlusPlusToken: // ++a
                return ts.createIdentifier(
                  `(${operand}=${BI}.ADD(${operand},BigInt(1)))`
                );
              case ts.SyntaxKind.MinusMinusToken: // --a
                return ts.createIdentifier(
                  `(${operand}=${BI}.subtract(${operand},BigInt(1)))`
                );
              /**
               * bigint 不支持+bn !nb
               * case ts.SyntaxKind.PlusToken:
                   break;
                 case ts.SyntaxKind.ExclamationToken:
                   break;
               */
              case ts.SyntaxKind.TildeToken: // ~a
                return ts.createIdentifier(`${BI}.bitwiseNot(${operand})`);
              case ts.SyntaxKind.MinusToken: // -a
                return ts.createIdentifier(`${BI}.unaryMinus(${operand})`);
            }
          }
          if (ts.isPostfixUnaryExpression(node)) {
            const operand = node.operand.getText();
            switch (node.operator) {
              case ts.SyntaxKind.PlusPlusToken: // a++
                return ts.createIdentifier(
                  `[${operand},${operand}=${BI}.ADD(${operand},BigInt(1))][0]`
                );
              case ts.SyntaxKind.MinusMinusToken: // a--
                return ts.createIdentifier(
                  `[${operand},${operand}=${BI}.subtract(${operand},BigInt(1))][0]`
                );
              // return ts.createArrayLiteral([node.operand,ts.createBinary(node.operand,ts.SyntaxKind.EqualsToken,)],false);
            }
          }

          // console.log("node", ts.SyntaxKind[node.kind], node.getText());

          visitorInOutCount -= 1;
          return ts.visitEachChild(node, visitor, ctx);
        };
        sf = ts.visitNode(sf, visitor);
        /**
         * 如果计数器没有归0，说明触发了BigInt相关的转换
         * 这时候就需要在文件头部注入自定义代码片段
         */
        bigintTransformCount.set(sf, visitorInOutCount);

        return sf;
      };
    }
  };
}
