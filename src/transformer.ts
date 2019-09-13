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
  [ts.SyntaxKind.ExclamationEqualsEqualsToken, "notEqual"], // !==
  [ts.SyntaxKind.ExclamationEqualsToken, "NE"], // !=
  [ts.SyntaxKind.LessThanToken, "lessThan"], //"<"
  [ts.SyntaxKind.LessThanEqualsToken, "lessThanOrEqual"], //"<="
  [ts.SyntaxKind.GreaterThanToken, "greaterThan"], //">"
  [ts.SyntaxKind.GreaterThanEqualsToken, "greaterThanOrEqual"] //">="
]);
const binaryKindToFunctionNameForMixTypes = new Map([
  ...binaryKindToFunctionName.entries(),
  [ts.SyntaxKind.EqualsEqualsToken, "EQ"], // "=="
  [ts.SyntaxKind.ExclamationEqualsToken, "NE"], //  !=
  [ts.SyntaxKind.LessThanToken, "LT"], // "<"
  [ts.SyntaxKind.LessThanEqualsToken, "LE"], // "<="
  [ts.SyntaxKind.GreaterThanToken, "GT"], // ">"
  [ts.SyntaxKind.GreaterThanEqualsToken, "GE"], // ">="
  [ts.SyntaxKind.PlusToken, "ADD"] // "+" 这个理论上不应该支持
]);
/**
 * 带赋值的运算
 * 因为bigint不能与其它类型进行运算，会导致类型出错：
 * `TypeError: Cannot mix BigInt and other types, use explicit conversions`
 * 所以不考虑提供`MixTypes`的支持
 */
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

const eqTokens = new Set([
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsToken
]);
const notEqualTokens = new Set([
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken
]);

/**
 *
 * @param typeChecker
 * @param JSBI JSBI GLOBAL SYMBOL NAME
 */
export function TransformerFactory(
  typeChecker: ts.TypeChecker,
  opts: { JSBI_GLOBAL_SYMBOL_NAME?: string; verbose?: boolean }
) {
  const { JSBI_GLOBAL_SYMBOL_NAME: BI = "JSBI" } = opts;

  const bigintTransformCount = new WeakMap<ts.SourceFile, number>();

  const REPLACE_PARENT_FLAG = Symbol("replace-parent");
  function replaceParent(node: ts.Node, parentNode: ts.Node) {
    return ((node.parent as any)[REPLACE_PARENT_FLAG] = parentNode);
  }
  return {
    bigintTransformCount,
    transformer(ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
      return (sf: ts.SourceFile) => {
        function isBigIntLike(type: ts.Type) {
          return (
            type.flags === ts.TypeFlags.BigInt ||
            type.flags === ts.TypeFlags.BigIntLiteral
          );
        }
        function createJSBIBigIntLiteral(val: string | number) {
          let valStr: string;
          let valNum: number;
          if (typeof val === "string") {
            valStr = val;
            valNum = parseInt(valStr);
          } else {
            // if(typeof val ==="number")
            valStr = val.toString();
            valNum = val;
          }
          if (
            valStr === valNum.toString() &&
            valNum <= Number.MAX_SAFE_INTEGER &&
            valNum >= Number.MIN_SAFE_INTEGER
          ) {
            return createJSBICall("BigInt", [ts.createNumericLiteral(valStr)]);
          }
          return createJSBICall("BigInt", [ts.createStringLiteral(valStr)]);
        }
        function createJSBICall(
          callName: string,
          argumentsArray?: ts.Expression[]
        ) {
          return ts.createCall(
            ts.createPropertyAccess(ts.createIdentifier(BI), callName),
            undefined,
            argumentsArray &&
              argumentsArray.map(argNode => ts.visitNode(argNode, visitor))
          );
        }
        function createSetVarWithCall(
          callName: string,
          left: ts.Expression,
          right: ts.Expression
        ) {
          return ts.createBinary(
            left,
            ts.SyntaxKind.EqualsToken,
            createJSBICall(callName, [left, right])
          );
        }
        function replaceAbleVisitEachChild<T extends ts.Node>(node: T): T {
          const newNode = ts.visitEachChild(node, visitor, ctx);
          return (node as any)[REPLACE_PARENT_FLAG] || newNode;
        }

        const visitorInOutCount = new Set<number>();
        let visitorId = 0;
        let visitor: ts.Visitor = (node: ts.Node): ts.Node => {
          const id = visitorId++;
          visitorInOutCount.add(id);
          /**
           * 值的声明
           */
          if (ts.isBigIntLiteral(node)) {
            const text = node.getText();
            // `${BI}.BigInt('${text.substr(0, text.length - 1)}')`
            return createJSBIBigIntLiteral(text.substr(0, text.length - 1));
          }
          // #region
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
          // #endregion
          /**
           * 二元运算符
           */
          if (ts.isBinaryExpression(node)) {
            const leftIsBigInt = isBigIntLike(
              typeChecker.getTypeAtLocation(node.left)
            )
              ? 1
              : 0;
            const rightIsBigInt = isBigIntLike(
              typeChecker.getTypeAtLocation(node.right)
            )
              ? 1
              : 0;
            let kindToFun: Map<ts.SyntaxKind, string> | undefined;
            const bothIsBigInt = leftIsBigInt + rightIsBigInt;
            if (bothIsBigInt == 1) {
              kindToFun = binaryKindToFunctionNameForMixTypes;
            } else if (bothIsBigInt === 2) {
              kindToFun = binaryKindToFunctionName;
            }
            if (kindToFun) {
              const biFunName = kindToFun.get(node.operatorToken.kind);
              /**
               * 1n + 1n
               * 无赋值的二元符号操作，左右两边必须都是bigint
               * 否则应该随着默认的类型转换来进行
               */
              if (biFunName) {
                // `${BI}.${jsbiFunctionName}(${node.left.getText()},${node.right.getText()})`
                return createJSBICall(biFunName, [node.left, node.right]);
              }
              const biAssignFunName = binaryWithEqualKindToFunctionName.get(
                node.operatorToken.kind
              );
              /**
               * a += 1n
               * 有赋值的二元符号操作，左右两边必须都是bigint
               * 否则应该随着默认的类型转换来进行
               */
              if (biAssignFunName) {
                // `${left}=${BI}.${jsbiFunctionWithEqualsName}(${left},${node.right.getText()})`
                return createSetVarWithCall(
                  biAssignFunName,
                  node.left,
                  node.right
                );
              }
            }
          }
          /**
           * 前置运算符
           */
          if (ts.isPrefixUnaryExpression(node)) {
            if (isBigIntLike(typeChecker.getTypeAtLocation(node.operand))) {
              switch (node.operator) {
                case ts.SyntaxKind.PlusPlusToken: // ++a
                  // `(${operand}=${BI}.ADD(${operand},BigInt(1)))`
                  return createSetVarWithCall(
                    "add",
                    node.operand,
                    createJSBIBigIntLiteral(1)
                  );
                case ts.SyntaxKind.MinusMinusToken: // --a
                  // `(${operand}=${BI}.subtract(${operand},BigInt(1)))`
                  return createSetVarWithCall(
                    "subtract",
                    node.operand,
                    createJSBIBigIntLiteral(1)
                  );
                /**
                 * bigint 不支持 `+a`
                 * case ts.SyntaxKind.PlusToken:
                 *   // throw TypeError: Cannot convert a BigInt value to a number
                 */
                case ts.SyntaxKind.ExclamationToken:
                  return ts.createPrefix(
                    ts.SyntaxKind.ExclamationToken,
                    createJSBICall("toNumber", [node.operand])
                  );
                case ts.SyntaxKind.TildeToken: // ~a
                  // `${BI}.bitwiseNot(${operand})`
                  return createJSBICall("bitwiseNot", [node.operand]);
                case ts.SyntaxKind.MinusToken: // -a
                  // `${BI}.unaryMinus(${operand})`
                  return createJSBICall("unaryMinus", [node.operand]);
              }
            }
          }
          /**
           * 后置运算符
           */
          if (
            ts.isPostfixUnaryExpression(node) &&
            isBigIntLike(typeChecker.getTypeAtLocation(node))
          ) {
            let funName = "";
            switch (node.operator) {
              case ts.SyntaxKind.PlusPlusToken: // a++
                funName = "ADD";
                break;
              case ts.SyntaxKind.MinusMinusToken: // a--
                funName = "subtract";
                break;
            }
            if (funName) {
              // `[${operand},${operand}=${BI}.ADD(${operand},BigInt(1))][0]`
              // `[${operand},${operand}=${BI}.subtract(${operand},BigInt(1))][0]`
              const arr = ts.createArrayLiteral(
                [
                  node.operand,
                  createSetVarWithCall(
                    funName,
                    node.operand,
                    createJSBIBigIntLiteral(1)
                  )
                ],
                false
              );
              return ts.createElementAccess(arr, 0);
            }
          }
          /**
           * typeof *
           */
          if (ts.isTypeOfExpression(node)) {
            const parentNode = node.parent;

            /**
             * 二元运算符 `==` / `!=` / `===` / `!==`
             */
            let notEqual = false;
            if (
              parentNode &&
              ts.isBinaryExpression(parentNode) &&
              // 只有等于不等于符号能够支持 **直接模式**
              (eqTokens.has(parentNode.operatorToken.kind) ||
                (notEqual = notEqualTokens.has(parentNode.operatorToken.kind)))
            ) {
              /**
               * 兄弟节点
               */
              const brotherNode =
                parentNode.right === node ? parentNode.left : parentNode.right;
              if (ts.isStringLiteral(brotherNode)) {
                /**
                 * **直接模式**
                 * 支持最直接的`a instanceof JSBI `模式
                 */
                if (brotherNode.text === "bigint") {
                  if (notEqual) {
                    return replaceParent(
                      node,
                      ts.createPrefix(
                        ts.SyntaxKind.ExclamationToken,
                        ts.updateBinary(
                          parentNode,
                          replaceAbleVisitEachChild(node.expression),
                          ts.createIdentifier(BI),
                          ts.SyntaxKind.InstanceOfKeyword
                        )
                      )
                    );
                  }
                  return replaceParent(
                    node,
                    ts.updateBinary(
                      parentNode,
                      replaceAbleVisitEachChild(node.expression),
                      ts.createIdentifier(BI),
                      ts.SyntaxKind.InstanceOfKeyword
                    )
                  );
                }
                /**
                 * **兼容模式**
                 * 不用修改。直接支持`typeof a`
                 */
                if (brotherNode.text !== "object") {
                  return replaceAbleVisitEachChild(node);
                }
              }
            }

            /**
             * **通用模式**
             * 使用`a instanceof JSBI?'bigint':typeof a`来替代
             */
            return ts.createConditional(
              ts.createBinary(
                node.expression,
                ts.SyntaxKind.InstanceOfKeyword,
                ts.createIdentifier(BI)
              ),
              ts.createStringLiteral("bigint"),
              node
            );
          }

          visitorInOutCount.delete(id);
          return replaceAbleVisitEachChild(node);
        };
        if (opts.verbose) {
          const _visitor = visitor;
          visitor = (node: ts.Node) => {
            const id = visitorId;
            const res = _visitor(node);
            if (!ts.isSourceFile(node)) {
              console.log(
                "node:",
                ts.SyntaxKind[node.kind],
                (() => {
                  try {
                    return node.getText();
                  } catch {
                    return "";
                  }
                })(),
                visitorInOutCount.has(id) ? "✔" : ""
              );
            }
            return res;
          };
        }
        sf = ts.visitNode(sf, visitor);
        /**
         * 如果计数器没有归0，说明触发了BigInt相关的转换
         * 这时候就需要在文件头部注入自定义代码片段
         */
        bigintTransformCount.set(sf, visitorInOutCount.size);

        return sf;
      };
    }
  };
}
