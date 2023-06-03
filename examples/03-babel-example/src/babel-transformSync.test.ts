import { describe, expect, it } from "vitest";
import { transformSync } from "@babel/core";

describe("记录 babel 转化", () => {
  it("使用 plugin 单独转化箭头函数", () => {
    const code = `let func = () => {};
    `;

    const result = transformSync(code, {
      plugins: ["@babel/plugin-transform-arrow-functions"],
    });

    /* 可以发现 let 并没有被转化为 var */
    expect(result.code).toMatchInlineSnapshot('"let func = function () {};"');
  });
  it("使用 preset-env 转化 Math.pow", () => {
    /* 根据 babel-compat-data 的  "transform-exponentiation-operator" 插件为 chrome 52 版本*/
    const code = `
    let x = 10 ** 2;`;

    const result = transformSync(code, {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: "chrome 51",
          },
        ],
      ],
    });

    expect(result.code).toMatchInlineSnapshot(`
      "\\"use strict\\";

      let x = Math.pow(10, 2);"
    `);
  });

  it("使用 preset-env 转化 Class", () => {
    /* 根据 babel-compat-data 的  "transform-exponentiation-operator" 插件为 chrome 52 版本*/
    const code = `class Test {
      constructor(name) {
        this.name = name;
      }
    
      logger() {
        console.log("Hello", this.name);
      }
    }
    `;

    const result = transformSync(code, {
      /* 根据 babel-compat-data 的  "transform-classes" 插件为 chrome 47 版本*/
      presets: [
        [
          "@babel/preset-env",
          {
            targets: "chrome 46",
          },
        ],
      ],
    });

    /* 经测试发现：会使用 prototype 以及 function 等方式去转换 */
    expect(result.code).toMatchInlineSnapshot(`
      "\\"use strict\\";

      class Test {
        constructor(name) {
          this.name = name;
        }
        logger() {
          console.log(\\"Hello\\", this.name);
        }
      }"
    `);
  });
});
