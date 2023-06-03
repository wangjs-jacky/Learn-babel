import { describe, expect, it } from "vitest";
import { transformSync } from "@babel/core";

describe("如何设置 targets", () => {
  it("1.使用 browserlist", () => {
    /* 直接在终端执行: npx browserslist "supports es6-module" */
  });

  it("2.使用 comat-table", () => {
    /* - 根据 compat-table : https://github.com/kangax/compat-table/blob/gh-pages/data-es6.js 
         此语法对应于 arrow functions，其中共有 subtests 13项，根据此文件查出 chrome 45 支持
       - 在 babel-compat-tabel: https://github.com/babel/babel/blob/main/packages/babel-compat-data/data/plugins.json)
         此语法对应于 "transform-arrow-function" 插件，根据此文件查出 chrome 版本为 47
      故，本次测试分别设定环境为 46/47
    */
    const code = `let func = () => 5`;
    const result1 = transformSync(code, {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: "chrome 46",
          },
        ],
      ],
    });
    const result2 = transformSync(code, {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: "chrome 47",
          },
        ],
      ],
    });
    expect(result1.code).toMatchInlineSnapshot(`
      "\\"use strict\\";

      var func = function func() {
        return 5;
      };"
    `);
    expect(result2.code).toMatchInlineSnapshot(`
      "\\"use strict\\";

      var func = () => 5;"
    `);
  });

  it("babel 在线 playground", () => {
    /* 地址：https://babeljs.io/repl */
  });
});
