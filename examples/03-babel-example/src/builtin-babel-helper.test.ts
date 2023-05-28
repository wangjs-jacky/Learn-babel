import { describe, expect, it } from "vitest";
import { transformSync } from "@babel/core";

/* 使用 helper 函数：使用变量提升工具 */
import hoistVariables from "@babel/helper-hoist-variables";
/* 使用 helper 函数：注入模块依赖 */
import importModule from "@babel/helper-module-imports";

/* 使用文档地址：https://babeljs.io/docs/babel-helper-hoist-variables */

const pluginA = function ({ types, template }) {
  return {
    visitor: {
      VariableDeclaration(path) {
        hoistVariables(
          path.parentPath,
          (id) => {
            path.scope.parent.push({
              id: path.scope.generateUidIdentifier(id.name),
            });
          },
          "const",
        );
      },
    },
  };
};

const pluginB = function ({ template }) {
  return {
    visitor: {
      /* 进入程序 node 阶段 */
      Program(path) {
        /* 1. 使用 importModule 添加 lodash 的默认导入 */
        importModule.addDefault(path, "lodash", {
          nameHint: "_",
        });

        /* 在 node.body 的最后添加代码 */
        path.node.body.push(template.ast(`const get = _.get`));
      },
    },
  };
};

describe("测试 babel 内置的 helper 函数", () => {
  it("测试 hoistVariables 变量提升辅助函数（将 const 声明的变量提升到全局环境, 且支持修改重命名变量）", () => {
    const code = `
    let node = {
      "func" : function(){
        const a = 1;
        const b = 2;
      }   
    }
    `;
    const res = transformSync(code, {
      plugins: [pluginA],
    });
    expect(res.code).toMatchInlineSnapshot(`
      "var _a, _b;
      let node = {
        \\"func\\": function () {
          a = 1;
          b = 2;
        }
      };"
    `);
  });
  it("测试 importModule 辅助函数", () => {
    const code = `console.log("123")`;
    const res = transformSync(code, {
      plugins: [pluginB],
    });
    expect(res.code).toMatchInlineSnapshot(`
      "import _ from \\"lodash\\";
      console.log(\\"123\\");
      const get = _.get;"
    `);
  });
  it("es6 转 es5 时，通过注入 _interopRequireDefault 运行时 helper 实现默认导入", () => {
    const code = `console.log("123")`;
    const res = transformSync(code, {
      plugins: [pluginB],
      presets: ["@babel/preset-env"],
    });
    expect(res.code).toMatchInlineSnapshot(`
      "\\"use strict\\";

      var _lodash = _interopRequireDefault(require(\\"lodash\\"));
      function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \\"default\\": obj }; }
      console.log(\\"123\\");
      var get = _lodash[\\"default\\"].get;"
    `);
  });
});
