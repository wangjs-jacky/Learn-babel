const importModule = require("@babel/helper-module-imports");
const { declare } = require("@babel/helper-plugin-utils");

const autoTrackPlugin = declare(
  ({ assertVersion, types, template }, options) => {
    assertVersion(7);
    return {
      visitor: {
        Program: {
          /* state : 收集 import 模块 */
          enter(path, state) {
            path.traverse({
              ImportDeclaration(curPath) {
                /* import aa from "xxx" 取出 xxx */
                const requirePath = curPath.node.source.value;
                debugger;
                if (requirePath === options.trackerPath) {
                  /* 取出 左边的 aa 此时注意是一个 node */
                  const specifierPath = curPath.node.specifiers[0];
                  /* 由于 tracker 这个包是默认导入 和 命名空间导入，不存在 {tracker} */
                  if (types.isImportSpecifier(specifierPath)) {
                    state.trackerImportId = specifierPath.local.name;
                    /* tracker 是命名空间导入 */
                  } else if (types.isImportNamespaceSpecifier(specifierPath)) {
                    state.trackerImportId = specifierPath.local.name;
                  } else {
                    /* 默认导入 */
                    state.trackerImportId = specifierPath.local.name;
                  }
                }
              },
            });

            /* 如果 traker 没有被引入 */
            if (!state.trackerImportId) {
              /* 创建一个 import _tracker from "tracker" */
              state.trackerImportId = importModule.addDefault(path, "tracker", {
                nameHint: path.scope.generateUid("tracker"),
              }).name;
              /* 将 _tracker() 的 ast 结构也缓存下来 */
              state.trackerAST = template.statement(
                `${state.trackerImportId}()`,
              )();
            }
          },
        },
        "ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration"(
          path,
          state,
        ) {
          const bodyPath = path.get("body");
          if (types.isBlockStatement(bodyPath)) {
            /* bodyPath.get("body") bodyPath.node.body */
            bodyPath.node.body.unshift(state.trackerAST);
          } else {
            /* 如果没有函数体需要包裹下，处理下返回值 */
            const ast = template.statement(
              `{${state.trackerImportId}();return PREV_BODY;}`,
            )({ PREV_BODY: bodyPath.node });
            debugger;
            bodyPath.replaceWith(ast);
          }
        },
      },
    };
  },
);

module.exports = autoTrackPlugin;
