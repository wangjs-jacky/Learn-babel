/* 实现功能说明：
   将 console.log(1);
   自动加入注入参数，如 console.log("文件名",1)
*/

// vitest 依赖
import { describe, it, expect } from "vitest";

// babel 依赖
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import types from "@babel/types";
import template from "@babel/template";

describe("console.log改造", () => {
  it("使用 types 工具判断语句是否为 console.log", () => {
    const sourceCode = `
      console.log(1);

      function func() {
          console.info(2);
      }
    `;

    const ast = parser.parse(sourceCode, {
      sourceType: "unambiguous" /* 自动识别 sourceCode 的模块类型 */,
    });

    traverse(ast, {
      CallExpression(path, state) {
        if (
          /* 传统方案，使用 types 工具判断 path.node 的结构 */
          types.isMemberExpression(path.node.callee) &&
          path.node.callee.object.name === "console" &&
          ["info", "debug", "error", "log"].includes(
            path.node.callee.property.name,
          )
        ) {
          const { line, column } = path.node.loc.start;
          path.node.arguments.unshift(
            types.stringLiteral(`文件名: (${line}, ${column})`),
          );
        }
      },
    });

    const { code, map } = generate(ast);
    expect(code).toMatchInlineSnapshot(`
      "console.log(\\"\\\\u6587\\\\u4EF6\\\\u540D: (2, 6)\\", 1);
      function func() {
        console.info(\\"\\\\u6587\\\\u4EF6\\\\u540D: (5, 10)\\", 2);
      }"
    `);
  });

  it("简易版：使用 generate 转化后字符串判断", () => {
    const sourceCode = `
      console.log(1);
      function func() {
          console.info(2);
      }
    `;

    const ast = parser.parse(sourceCode, {
      sourceType: "unambiguous" /* 自动识别 sourceCode 的模块类型 */,
    });

    traverse(ast, {
      CallExpression(path, state) {
        const calleeName = generate(path.node.callee).code;
        if (
          /* 使用 generate 语法转化为字符串比较 */
          ["log", "info", "error", "debug"]
            .map((item) => `console.${item}`)
            .includes(calleeName)
          /* 也可以使用 path.get("callee").toString() === "console.log"  */
        ) {
          const { line, column } = path.node.loc.start;
          /* path.node.arguments.unshift(
            types.stringLiteral(`文件名: (${line}, ${column})`),
          ); */

          path.node.arguments.unshift({
            type: "StringLiteral",
            value: `文件名: (${line}, ${column})`,
          });
        }
      },
    });

    const { code, map } = generate(ast);
    expect(code).toMatchInlineSnapshot(`
      "console.log(\\"\\\\u6587\\\\u4EF6\\\\u540D: (2, 6)\\", 1);
      function func() {
        console.info(\\"\\\\u6587\\\\u4EF6\\\\u540D: (4, 10)\\", 2);
      }"
    `);
  });

  it("inserBefore api 使用", () => {
    const sourceCode = `
      console.log(1);

      function func() {
          console.info(2);
      }
    `;

    const ast = parser.parse(sourceCode, {
      sourceType: "unambiguous",
    });

    const targetCalleeName = ["log", "info", "error", "debug"].map(
      (item) => `console.${item}`,
    );

    traverse(ast, {
      CallExpression(path, state) {
        if (path.node.isNew) {
          return;
        }
        const calleeName = generate(path.node.callee).code;

        if (targetCalleeName.includes(calleeName)) {
          const { line, column } = path.node.loc.start;
          const newNode = template.expression(
            `console.log("文件名: (${line}, ${column})")`,
          )();
          newNode.isNew = true;
          path.insertBefore(newNode);
        }
      },
    });

    const { code, map } = generate(ast);
    expect(code).toMatchInlineSnapshot(`
      "console.log(\\"文件名: (2, 6)\\")
      console.log(1);
      function func() {
        console.log(\\"文件名: (5, 10)\\")
        console.info(2);
      }"
    `);
  });
});
