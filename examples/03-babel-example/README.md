## 前言

本项目为 `Babel` 基础使用及插件开发案例。



## 使用方案

终端执行：`npm run test:unit`

强制更新快照： `npm run test:unit -- -u`



## 文件说明：

本项目共提供三个文件：

1. `babel-transformSync.test.ts` ：如何将 `es6` 转为 `es5`？
2. `builtin-babel-helper.test.ts`：如何单独使用 `@babel/helper` 插件？
3. `remove-plugin.test.ts`：由 `syntax-plugin` 内置插件引申出对于 `manipulateOptions` 的测试。



## 结论

> 通过这些测试需要获取到的知识点

`babel-transformSync.test.ts` 可知如下：

1. 单独使用 `plugin`

   ```typescript
   // 将箭头函数转 function 形式
   const result = transformSync(code, {
     plugins: ["@babel/plugin-transform-arrow-functions"],
   });
   ```

2. 使用 `preset-env`

   ```typescript
   const result = transformSync(code, {
     presets: ["@babel/preset-env"],
     targets: "ie >= 11",
   });
   ```

   `babel v7` 后，`preset-env` 默认支持全部的 `babel` 插件，通过 `targets` 对插件过滤。经测试 `ie >= 11` 或者 `last 2 versions` 可以转化为 `es5` 代码。

   除此之外，对 `class` 转化后，可发现，`babel` 转化此类代码会往 **全局** 注入 `polyfill` 代码，如：

   ```typescript
   function _typeof(obj) {}
   function _classCallCheck(instance, Constructor) {}
   function _defineProperties(target, props) {}
   function _createClass(Constructor, protoProps, staticProps) {}
   function _toPropertyKey(arg) {}
   function _toPrimitive(input, hint) {}
   ```

   原 `code` 为：

   ```typescript
   class Test {
     constructor(name) {
       this.name = name;
     }
     logger() {
       console.log("Hello", this.name);
     }
   }
   ```

   转换为：

   ```typescript
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
   }();



`builtin-babel-helper.test.ts` 测试案例可知：

- 如何测试？编写 `babel` 插件，使用 `transformSync` 作用插件。

- 使用内置的 `helper` 函数，实现变量提升

  将源代码：

  ```typescript
  let node = {
    "func" : function(){
      const a = 1;
      const b = 2;
    }   
  }
  ```

  转换如下：

  ```typescript
  var _a, _b;
  let node = {
    "func": function () {
      a = 1;
      b = 2;
    }
  };"
  ```

  > 注：以上代码肯定是一次错误的尝试，主要是为了加深对官方内置插件  `@babel/helper-hoist-variables` 的使用，一共做了两个操作：
  >
  > 1. 将 函数体内的 `const` 声明删去。
  > 2. 与之对应的是在头部添加  `var` + `变量对应的 identity` 。



`remove-plugin.test.ts` 测试案例可知：

这个案例主要起源于 `babel` 内置的 `syntax` 插件，随便看一个插件，如 [babel-plugin-syntax-jsx](https://github.com/babel/babel/tree/main/packages/babel-plugin-syntax-jsx)

```typescript
import { declare } from "@babel/helper-plugin-utils";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-jsx",

    manipulateOptions(opts, parserOpts) {
      if (!process.env.BABEL_8_BREAKING) {
        // If the Typescript plugin already ran, it will have decided whether
        // or not this is a TSX file.
        if (
          parserOpts.plugins.some(
            p => (Array.isArray(p) ? p[0] : p) === "typescript",
          )
        ) {
          return;
        }
      }

      parserOpts.plugins.push("jsx");
    },
  };
});
```

这个插件的目的，是为了让 `babel` 识别 `.jsx` 语法。

在 `babel` 中处理这个 `.jsx` 有两个路径，由 `preset-react` 处理，或者使用 `preset-typescrit` 。因此这个插件的含义就是，如果发现当前文件已经是 `ts` 文件了，那就直接 `return` ，由 `typescript` 去处理 `jsx` 语法，否则 `parseOpts` 中添加 `jsx`。

由于 `manipulateOptions` 的作用就很清晰了，可以某些条件生成 `opts` 或者  `pareseOpts` 。

希望实现如下效果，删除某个插件。

```typescript
const result = transformSync(code, {
  plugins: ["@babel/plugin-transform-arrow-functions", removePlugin],
});
```

`removePlugin` 就是使 `@babel/plugin-transform-arrow-functions` 不生效。

