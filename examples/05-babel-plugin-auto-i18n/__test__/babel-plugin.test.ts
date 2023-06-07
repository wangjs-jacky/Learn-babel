import { describe, it } from "vitest";
import { transformFromAstSync } from "@babel/core";
import parser from "@babel/parser";
import fs from "fs";
import path from "path";
import { expect } from "vitest";

import autoTrackPlugin from "../src/autoI18nPlugin";

describe("插件：自动国际化", () => {
  it("hello", () => {
    const sourceCode = fs.readFileSync(
      path.join(__dirname, "./sourceCode.js"),
      {
        encoding: "utf-8",
      },
    );

    const ast = parser.parse(sourceCode, {
      sourceType: "unambiguous",
      plugins: ["jsx"],
    });

    const { code } = transformFromAstSync(ast, sourceCode, {
      plugins: [
        [
          autoTrackPlugin,
          {
            /* options 中填写需要注入的包名 */
            trackerPath: "tracker",
            outputDir: path.join(__dirname, "../dist"),
          },
        ],
      ],
    });
    expect(code).toMatchInlineSnapshot(`
      "import _intl from 'intl';
      import intl from \\"intl2\\";
      function App() {
        const title = _intl.t('intl1');
        const desc = _intl.t('intl2');
        const desc2 = \`desc2\`;
        const desc3 = _intl.t('intl3', title + desc, desc2);
        return <div className={_intl.t('intl4')} title={_intl.t('intl5')}>
            <img src={Logo} />
            <h1>\${title}</h1>
            <p>\${desc}</p>
            <div>{\\"中文\\"}</div>
          </div>;
      }"
    `);
  });
});
