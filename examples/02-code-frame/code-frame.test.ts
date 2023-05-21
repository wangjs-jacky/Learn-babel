import { describe, expect, it } from "vitest";

const { codeFrameColumns } = require("@babel/code-frame");

const code = `
const a = 1;
const b = 2;
`;

describe("使用 code-frame 实现错误提示", () => {
  it("01.打印出标记相应位置代码的 code frame", () => {
    const res = codeFrameColumns(
      code,
      {
        start: { line: 2, column: 1 },
        end: { line: 3, column: 5 },
      },
      {
        /* 此部分为 options  */
        highlightCode: true,
        message: "这里出错了",
        /* forceColor: true, */
      },
    );
    expect(res).toMatchInlineSnapshot(`
      "  1 |
      > 2 | const a = 1;
          | ^^^^^^^^^^^^
      > 3 | const b = 2;
          | ^^^^^ 这里出错了
        4 |"
    `);
  });
  it("02.语法高亮", () => {
    const res = codeFrameColumns(
      code,
      {
        start: { line: 2, column: 1 },
        end: { line: 3, column: 5 },
      },
      {
        /* 此部分为 options  */
        highlightCode: true,
        message: "这里出错了",
        forceColor: true,
      },
    );
    console.log("res", res);

    expect(res).toMatchInlineSnapshot(`
      "[0m [90m 1 |[39m[0m
      [0m[31m[1m>[22m[39m[90m 2 |[39m [36mconst[39m a [33m=[39m [35m1[39m[33m;[39m[0m
      [0m [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[0m
      [0m[31m[1m>[22m[39m[90m 3 |[39m [36mconst[39m b [33m=[39m [35m2[39m[33m;[39m[0m
      [0m [90m   |[39m [31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m[31m[1m^[22m[39m [31m[1m这里出错了[22m[39m[0m
      [0m [90m 4 |[39m[0m"
    `);
  });
});
