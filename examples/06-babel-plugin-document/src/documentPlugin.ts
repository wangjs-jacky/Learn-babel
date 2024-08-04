import { declare } from "@babel/helper-plugin-utils";
import generate from "@babel/generator";
import * as doctrine from "doctrine";
import fse from "fs-extra";
import path from "path";

const doctrine = require('doctrine');

function parseComment(commentStr) {
    if (!commentStr) {
        return;
    }
    return doctrine.parse(commentStr, {
        unwrap: true
    });
}

const documentPlugin = declare(
  ({ assertVersion, types, template }, options) => {
    assertVersion(7);
    return {
      // 收集函数声明的文档信息
      pre(file) {
        // 初始化 state.file.docs
        file.set('docs', []);
      },
      // 通过 visitor 遍历 AST
      visitor: {
        FunctionDeclaration(path, state) {
          const docs = state.file.get('docs');
          // 【提取】函数名称，等价于 path.node.id.name
          const name = path.get("id").name

          // 【提取】函数的入参和出参（及类型）
          // 入参: path.get('params') 等价于 path.node.params
          // 出参: path.get('returnType') 等价于 path.node.returnType
          // path.get("returnType").data.typeAnnotation.type 等价于 path.get('returnType').getTypeAnnotation()
          const params = path.get('params').map(paramPath => {
            return {
              // 入参名称：
              name: paramPath.toString(),
              // 出参名称：
              type: paramPath.getTypeAnnotation()
            }
          });

          // 注：此时提取的 ts 类型需进一步处理
          // 如 TSNumberKeyword → number
          //    TSStringKeyword → string
          //    TSBooleanKeyword → boolean
          //    TSVoidKeyword → void
          const returnType = path.get("returnType").getTypeAnnotation().type

          // 【提取】注释
          //  path.node.leadingComments[0].value 等价于 path.get("leadingComments")[0].node.value
          const commentStr = path.node.leadingComments[0].value;

          // 支持 @xxx 的解析，如 @param {string} name
          const parseByDoctrine= parseComment(commentStr);

          docs.push({
            type: 'function',
            name:name,
            params: params,
            return: returnType,
            doc: parseByDoctrine
          });
          // docs → state.file.docs
          state.file.set('docs', docs);
        },
      },

      post(file) {
        const docs = file.get('docs');
        // 生成文档内容
        fse.writeFileSync(path.join(".", 'docs.json'), JSON.stringify(docs,null,2));
    }
    };
  },
);

export default documentPlugin;
