import { declare } from "@babel/helper-plugin-utils";
import generate from "@babel/generator";
import * as doctrine from "doctrine";

const documentPlugin = declare(
  ({ assertVersion, types, template }, options) => {
    assertVersion(7);
    return {
      pre(file) {
        file.set('docs', []);
      },
      visitor: {
        FunctionDeclaration(path, state) {
          const docs = state.file.get('docs');
          docs.push({
            type: 'function',
            name: path.get('id').toString(),
            params: path.get('params').map(paramPath => {
              return {
                name: paramPath.toString(),
                type: paramPath.getTypeAnnotation()
              }
            }),
            return: path.get('returnType').getTypeAnnotation(),
            doc: path.node.leadingComments && parseComment(path.node.leadingComments[0].value)
          });
          state.file.set('docs', docs);
        },
      },
    };
  },
);

export default documentPlugin;
