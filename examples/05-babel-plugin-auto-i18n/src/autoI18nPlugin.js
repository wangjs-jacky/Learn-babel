const { declare } = require("@babel/helper-plugin-utils");
const generate = require("@babel/generator").default;
import fse from "fs-extra";
import path from "path";

let intlIndex = 0;
function nextIntlKey() {
  ++intlIndex;
  return `intl${intlIndex}`;
}

const autoI18nPlugin = declare(
  ({ assertVersion, types, template }, options) => {
    assertVersion(7);

    /* 生成 ast expression */
    /* 
      const a = '中文';
      const a = intl.t('intl1');

      const str = `你好 ${name}`;
      const str = intl.t('intl2', name);
    */

    if (!options.outputDir) {
      throw new Error("outputDir in empty");
    }

    function getReplaceExpression(path, value, intlUid) {
      const expressionParams = path.isTemplateLiteral()
        ? /* 提取 `aaa ${title + desc} bbb ${desc2} ccc` 生成 [ title + desc, desc2]*/
          path.node.expressions.map((item) => generate(item).code)
        : null;

      let replaceExpression = template.ast(
        `${intlUid}.t('${value}'${
          expressionParams ? "," + expressionParams.join(",") : ""
        })`,
      ).expression;

      /* 找 <div className="abc">  过滤<div className={"abc"}> */
      if (
        path.findParent((p) => p.isJSXAttribute()) &&
        !path.findParent((p) => p.isJSXExpressionContainer())
      ) {
        replaceExpression = types.JSXExpressionContainer(replaceExpression);
      }
      return replaceExpression;
    }

    function save(file, key, value) {
      const allText = file.get("allText");
      allText.push({
        key,
        value,
      });
      file.set("allText", allText);
    }

    return {
      pre(file) {
        file.set("allText", []);
      },
      visitor: {
        Program: {
          /* state : 收集 import 模块 */
          enter(path, state) {
            let intlImported;
            path.traverse({
              ImportDeclaration(p) {
                const source = p.node.source.value;
                if (source === "intl") {
                  intlImported = true;
                }
              },
            });
            if (!intlImported) {
              const uid = path.scope.generateUid("intl");
              const importAst = template.ast(`import ${uid} from 'intl'`);
              path.node.body.unshift(importAst);
              state.intlUid = uid;
            }

            path.traverse({
              "StringLiteral|TemplateLiteral"(path) {
                if (path.node.leadingComments) {
                  /* 是否保留注释 */
                  path.node.leadingComments = path.node.leadingComments.filter(
                    (comment, index) => {
                      if (comment.value.includes("i18n-disable")) {
                        /* 标记下 */
                        path.node.skipTag = true;
                        return false; /* 不保留 */
                      }
                      return true; /* 保留 */
                    },
                  );
                }

                /* 若字符串是以 import 方式导入，则需要跳过 */
                if (path.findParent((p) => p.isImportDeclaration())) {
                  path.node.skipTag = true;
                }
              },
            });
          },
        },
        StringLiteral(path, state) {
          /* 判断当前是否为 */
          if (path.node.skipTag) return;
          let key = nextIntlKey();

          /* file - 提供的 file 对象
             key - intl1/2/3/....
             value - path.node.value
          */

          save(state.file, key, path.toString());

          const replaceExpression = getReplaceExpression(
            path /* 当前节点 */,
            key /* 由 nextIntlKey 自动累加生成 */,
            state.intlUid /* intl.t */,
          );

          path.replaceWith(replaceExpression);
          path.skip();
        },
        TemplateLiteral(path, state) {
          if (path.node.skipTag) {
            return;
          }
          const value = path
            .get("quasis")
            .map((item) => item.node.value.raw)
            .join("{placeholder}");

          if (value) {
            let key = nextIntlKey();
            save(state.file, key, value);

            const replaceExpression = getReplaceExpression(
              path,
              key,
              state.intlUid,
            );
            path.replaceWith(replaceExpression);
            path.skip();
          }
        },
      },

      post(file) {
        const allText = file.get("allText");
        const intlData = allText.reduce((obj, item) => {
          obj[item.key] = item.value;
          return obj;
        }, {});

        debugger;

        const content = `const resource = ${JSON.stringify(
          intlData,
          null,
          4,
        )};\nexport default resource;`;
        fse.ensureDirSync(options.outputDir);
        fse.writeFileSync(path.join(options.outputDir, "zh_CN.js"), content);
        fse.writeFileSync(path.join(options.outputDir, "en_US.js"), content);
      },
    };
  },
);

export default autoI18nPlugin;
