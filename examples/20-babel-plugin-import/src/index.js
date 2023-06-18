import Plugin from "./Plugin.js"

export default function ({ types }, options) {
  let plugin = null;
  return {
    pre: function () {

    },
    visitor: {
      Program: {
        enter(path, state) {
          const babelOpts = {
            ...options,
          }
          plugin = new Plugin(babelOpts, types);
          plugin["ProgramEnter"](...arguments);
        },
        exit() {
          plugin["ProgramExit"](...arguments);
        }
      },
      'ImportDeclaration': function () {
        /* 通过 function 中的 argument 可以获取透传参数 path 和 node */
        plugin["ImportDeclaration"](...arguments);
      },
      "CallExpression": function () {
        plugin["CallExpression"](...arguments);
      }
    }
  }
}