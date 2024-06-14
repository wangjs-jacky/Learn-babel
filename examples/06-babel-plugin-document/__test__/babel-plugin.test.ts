import { describe, it, expect } from "vitest";
import { transformFromAstSync } from "@babel/core";
import parser from "@babel/parser";
import fs from "fs";
import path from "path";

import documentPlugin from "../src/documentPlugin.js";

describe("插件：提取注释，并输出为格式化文件", () => {
  it("hello", () => {
    const sourceCode = fs.readFileSync(
      path.join(__dirname, "./sourceCode.ts"),
      {
        encoding: "utf-8",
      },
    );

    const ast = parser.parse(sourceCode, {
      sourceType: "unambiguous",
      plugins: ["typescript"],
    });

    const { code } = transformFromAstSync(ast, sourceCode, {
      plugins: [[documentPlugin, {}]],
    });

    expect(code).toMatchInlineSnapshot(`
      "/**
       * say 你好
       * @param name 名字
       */
      function sayHi(name: string, age: number, a: boolean): string {
        console.log(\`hi, \${name}\`);
        return \`hi, \${name}\`;
      }

      /**
       * 类测试
       */
      class Guang {
        name: string; // name 属性
        constructor(name: string) {
          this.name = name;
        }

        /**
         * 方法测试
         */
        sayHi(): string {
          return \`hi, I'm \${this.name}\`;
        }
      }"
    `);
  });
});
