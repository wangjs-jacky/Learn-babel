import { describe, expect, it } from "vitest";
import { transformSync } from "@babel/core";

/* 在研究 syntax 语法时，发现经常使用到 manipulationOptions 这个钩子，测试插件如下： */
const removePlugin = {
  name: "remove-plugin",
  manipulateOptions(opts, parserOpts) {
    // 修改插件配置选项
    opts.plugins = opts.plugins.filter(
      (plugin) => plugin.key !== "transform-arrow-functions",
    );
  },
};

describe("syntax 插件调研", () => {
  it("测试 removePlugin 是否支持去除 babel 内置的 箭头函数 transform 插件", () => {
    const code = `let func = () => {};
    `;

    const result = transformSync(code, {
      plugins: ["@babel/plugin-transform-arrow-functions", removePlugin],
    });

    /* ❎：虽然失败，但是通过断点调试发现 plugin 确实去除成功。 */
    expect(result.code).toMatchInlineSnapshot('"let func = function () {};"');
  });
});
