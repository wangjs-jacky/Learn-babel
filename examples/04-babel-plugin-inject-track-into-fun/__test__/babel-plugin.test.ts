import { describe, it } from "vitest";
import { transformFromAstSync } from "@babel/core";
import parser from "@babel/parser";
import fs from "fs";
import path from "path";
import { expect } from "vitest";

const autoTrackPlugin = require("../src/autoTrackPlugin");

describe("插件：自动在函数中注入工具库", () => {
  it("hello", () => {
    const sourceCode = fs.readFileSync(
      path.join(__dirname, "./sourceCode.js"),
      {
        encoding: "utf-8",
      },
    );

    const ast = parser.parse(sourceCode, {
      sourceType: "unambiguous",
    });

    const { code } = transformFromAstSync(ast, sourceCode, {
      plugins: [
        [
          autoTrackPlugin,
          {
            /* options 中填写需要注入的包名 */
            trackerPath: "tracker",
          },
        ],
      ],
    });
    expect(code).toMatchInlineSnapshot(`
      "import { tracker } from \\"tracker\\";
      import tracker2 from \\"tracker\\";
      import * as tracker3 from \\"tracker\\";
      import aa from \\"aa\\";
      import * as bb from \\"bb\\";
      import { cc } from \\"cc\\";
      import \\"dd\\";

      /* function 生命式 */
      function a() {console.log(\\"aaa\\");
      }

      /* function 变量式 */
      const d = function () {console.log(\\"ddd\\");
      };

      /* function 无函数体 */
      const c = () => {
        tracker3();
        return \\"ccc\\";
      };

      /* 类 */
      class B {
        bb() {return \\"bbb\\";
        }
      }"
    `);
  });
});
