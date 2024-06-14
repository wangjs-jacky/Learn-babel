import { join } from "path";
import { addSideEffect, addDefault } from '@babel/helper-module-imports';


export default class Plugin {
  constructor(babelOpts, types) {
    const {
      libraryName,  /* 需要识别的包 */
      libraryDirectory = "lib", /* 子文件夹 */
      style = false
    } = babelOpts;

    this.libraryName = libraryName;
    this.libraryDirectory = libraryDirectory;
    this.style = style;
    this.babelOpts = babelOpts;
    this.types = types; /* babel-type 工具函数 */
  }

  /* enter */
  ProgramEnter(path, state) {
    state.methodsMap = {}; /* 导入的模块 */
    state.selectedMethods = {};
    state.pathsToRemove = [];
  }

  ProgramExit(path, state) {
    state.pathsToRemove.forEach(p => {
      if (!p.removed /* 如果没有被 removed 执行 remove 指令*/) {
        p.remove();
      }
    })
  }

  /* 收集 import 模块信息 */
  ImportDeclaration(path, state) {
    const { node } = path;
    /* 举例：import { Button as MyButton } from 'antd'; */
    /* antd - node.source.value 
       其中 node.specifiers 是一个数组，因为可能导入多端语句
       Button - node.specifiers.ImportSpecifier.imported.name
       MyButton - node.specifiers.ImportSpecifier.local.name
    */
    const { value } = node.source;
    const {
      libraryName,
    } = this.babelOpts;

    debugger;

    /* 处理要处理的 module */
    if (value === libraryName) {
      node.specifiers.forEach(spec => {
        /* 1. 单独处理具名导入 */
        if (this.types.isImportSpecifier(spec)) {
          /* 将 { MyButton : Button } 存在 state 的 methodsMap 上 */
          state.methodsMap[spec.local.name] = spec.imported.name;
        } else {
          /* 处理 默认/具名 导入 */
          /* 即： ImportDefaultSpecifier 和 ImportNamespaceSpecifier
             这两类导入只有 spec.local 而没有 spec.imported 属性。
          */
          state.libraryObjs[spec.local.name] = true;
        }
      })
      /* 将原有节点删除（有点搞不懂为啥不直接去替换？） */
      state.pathsToRemove.push(path);
    }
  }

  CallExpression(path, state) {
    const { node } = path;
    const file = path && path.hub && path.hub.file;

    /* Func("xxx")  Func.aaa("xxx")*/
    const { name } = node.callee;

    debugger;

    /*  排除 MemberExpression */
    if (this.types.isIdentifier(node.callee)) {
      /* 将 { MyButton : Button } 存在 state 的 methodsMap 上 */
      /* 取出挂载在 methodsMap 的 state */
      if (state.methodsMap[name]) {
        node.callee = this.importMethod(state.methodsMap[name], file, state);
      }
    }

    /* React.creatElement(Button,null,"xxxx") */
    node.arguments = node.arguments.map(arg => {
      const { name: argName /* Button */ } = arg;
      if (
        state.methodsMap[argName] &&
        /* 判断 Button 是否为 import 类型 */
        path.scope.hasBinding(argName) &&
        path.scope.getBinding(argName).path.type === 'ImportSpecifier'
      ) {
        return this.importMethod(state.methodsMap[argName], file, state);
      }
      return arg;
    });
  }

  importMethod(methodName, file, state) {
    if (!state.selectedMethods[methodName]) {
      const { style, libraryDirectory, libraryName } = this.babelOpts;

      // 兼容 windows 路径
      // path.join('antd/lib/button') == 'antd/lib/button'
      const path = winPath(join(libraryName, libraryDirectory, methodName));
      /* 
      import Button from "antd/lib/button";
      importModule.addDefault(path, 'antd/lib/button', {
          nameHint: "Button",
      });
      返回值： ast 树
      */
      state.selectedMethods[methodName] = addDefault(file.path, path, { nameHint: methodName, })
      if (style) {
        // import 'antd/lib/button/style'
        addSideEffect(file.path, `${path}/style`)
      }
      return state.selectedMethods[methodName];
    }
  }

}

/**
 * 兼容 Windows 路径
 * @param {*} path 
 */
function winPath(path) {
  return path.replace(/\\/g, '/');
}
