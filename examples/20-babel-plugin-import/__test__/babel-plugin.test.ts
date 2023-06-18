import { describe, it, expect } from "vitest";
import { transformSync } from "@babel/core";
import fs from "fs";
import path from "path";

import babelPluginImport from "../src/index.js";

describe("插件：", () => {
  it("hello", () => {
    debugger;
    const sourceCode = fs.readFileSync(
      path.join(__dirname, "./sourceCode.tsx"),
      {
        encoding: "utf-8",
      },
    );

    const { code } = transformSync(sourceCode, {
      plugins: [
        [
          babelPluginImport,
          {
            libraryName: "antd",
            libraryDirectory: "lib",
            style: true,
          },
        ],
      ],
      presets: ["@babel/preset-react"],
      /*  parserOpts: {
        sourceType: "unambiguous",
        plugins: ["jsx"],
      }, */
    });

    expect(code).toMatchInlineSnapshot(`
      "import \\"antd/lib/Button/style\\";
      import _Button from \\"antd/lib/Button\\";
      import \\"antd/lib/message/style\\";
      import _message from \\"antd/lib/message\\"; // @ts-nocheck
      _message(\\"xxx\\");
      ReactDOM.render( /*#__PURE__*/React.createElement(\\"div\\", null, /*#__PURE__*/React.createElement(_Button, null, \\"xxxx\\")));"
    `);
  });
});
