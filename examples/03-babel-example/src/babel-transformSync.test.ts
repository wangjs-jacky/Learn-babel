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
    const code = `
    let func = () => {}
    let x = 10 ** 2;`;

    const result = transformSync(code, {
      presets: ["@babel/preset-env"],
      targets: "ie >= 11",
    });

    expect(result.code).toMatchInlineSnapshot(`
      "\\"use strict\\";

      var func = function func() {};
      var x = Math.pow(10, 2);"
    `);
  });

  it("使用 preset-env 转化 Class", () => {
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
      presets: ["@babel/preset-env"],
    });

    /* 经测试发现：会使用 prototype 以及 function 等方式去转换 */
    expect(result.code).toMatchInlineSnapshot(`
      "\\"use strict\\";

      function _typeof(obj) { \\"@babel/helpers - typeof\\"; return _typeof = \\"function\\" == typeof Symbol && \\"symbol\\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \\"function\\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \\"symbol\\" : typeof obj; }, _typeof(obj); }
      function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\\"Cannot call a class as a function\\"); } }
      function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\\"value\\" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
      function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \\"prototype\\", { writable: false }); return Constructor; }
      function _toPropertyKey(arg) { var key = _toPrimitive(arg, \\"string\\"); return _typeof(key) === \\"symbol\\" ? key : String(key); }
      function _toPrimitive(input, hint) { if (_typeof(input) !== \\"object\\" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || \\"default\\"); if (_typeof(res) !== \\"object\\") return res; throw new TypeError(\\"@@toPrimitive must return a primitive value.\\"); } return (hint === \\"string\\" ? String : Number)(input); }
      var Test = /*#__PURE__*/function () {
        function Test(name) {
          _classCallCheck(this, Test);
          this.name = name;
        }
        _createClass(Test, [{
          key: \\"logger\\",
          value: function logger() {
            console.log(\\"Hello\\", this.name);
          }
        }]);
        return Test;
      }();"
    `);
  });
});
