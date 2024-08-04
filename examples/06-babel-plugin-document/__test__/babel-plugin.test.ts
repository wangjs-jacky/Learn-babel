import { describe, it, expect } from "vitest";
import { transformFromAstSync } from "@babel/core";
import parser from "@babel/parser";
import fs from "fs";
import path from "path";
import { readJSON } from 'fs-extra/esm'

import documentPlugin from "../src/documentPlugin.js";

describe("插件：提取注释，并输出为格式化文件", () => {
  it("测试函数", async () => {
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

    // 使用 babel 插件的方式执行代码
    const { code } = transformFromAstSync(ast, sourceCode, {
      plugins: [[documentPlugin, {}]],
    });

    const content = await readJSON("./docs.json", { throws: false })
    
    expect(content).toMatchInlineSnapshot(`
      [
        {
          "doc": {
            "description": "say 你好",
            "tags": [
              {
                "description": "{string} 名字",
                "name": "name",
                "title": "param",
                "type": null,
              },
              {
                "description": "{number} 年龄",
                "name": "age",
                "title": "param",
                "type": null,
              },
              {
                "description": "{boolean} 是否",
                "name": "v3",
                "title": "param",
                "type": null,
              },
              {
                "description": null,
                "title": "returns",
                "type": {
                  "name": "string",
                  "type": "NameExpression",
                },
              },
            ],
          },
          "params": [
            {
              "name": "name",
              "type": {
                "end": 146,
                "loc": {
                  "end": {
                    "column": 27,
                    "index": 146,
                    "line": 8,
                  },
                  "start": {
                    "column": 21,
                    "index": 140,
                    "line": 8,
                  },
                },
                "start": 140,
                "type": "TSStringKeyword",
              },
            },
            {
              "name": "age",
              "type": {
                "end": 159,
                "loc": {
                  "end": {
                    "column": 40,
                    "index": 159,
                    "line": 8,
                  },
                  "start": {
                    "column": 34,
                    "index": 153,
                    "line": 8,
                  },
                },
                "start": 153,
                "type": "TSNumberKeyword",
              },
            },
            {
              "name": "v3",
              "type": {
                "end": 172,
                "loc": {
                  "end": {
                    "column": 53,
                    "index": 172,
                    "line": 8,
                  },
                  "start": {
                    "column": 46,
                    "index": 165,
                    "line": 8,
                  },
                },
                "start": 165,
                "type": "TSBooleanKeyword",
              },
            },
          ],
          "return": "TSStringKeyword",
          "type": "function",
        },
      ]
    `)
  });
});
