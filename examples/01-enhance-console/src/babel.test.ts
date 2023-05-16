import { transformFileSync } from "@babel/core";
import { describe, expect, it } from "vitest";
import * as path from "path";
const insertParametersPlugin = require("./enhanceConsole");

describe("封装 babel 插件", () => {
  it("basic", () => {
    const { code } = transformFileSync(
      path.join(__dirname, "./sourceCode.js"),
      {
        plugins: [insertParametersPlugin],
        parserOpts: {
          sourceType: "unambiguous",
          plugins: ["jsx"],
        },
      },
    );
    expect(code).toMatchInlineSnapshot(`
      "console.log(\\"/Users/jiashengwang/Project/Learn-babel/examples/01-enhance-console/src/sourceCode.js: (1, 0)\\")
      console.log(1);
      function func() {
        console.log(\\"/Users/jiashengwang/Project/Learn-babel/examples/01-enhance-console/src/sourceCode.js: (4, 2)\\")
        console.info(2);
      }"
    `);
  });
});
