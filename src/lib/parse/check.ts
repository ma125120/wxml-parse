import { throwError } from "../common";
import { ElementNode, RootNode, TextNode } from "./nodes";
import { traverse } from "./traverse";
import { NODE_TYPES } from "./type";

export const checkValidate = (root: RootNode) => {
  // 遍历AST，不正确的属性将会报错
  traverse(root, {
    [NODE_TYPES.ELEMENT](node: ElementNode) {
      if (!node.selfClosing && !node.closing) {
        throwError(`${node.tagName} 标签未正确闭合，无法解析`);
      }

      if (node.tagName === "wxs") {
        if (!node.attributes["module"]) {
          throwError(`${node.tagName} 标签 必须具有 module 属性`);
        }

        console.log(node.childNodes.length && 1, node);
        if (
          node.childNodes.length &&
          !(node.childNodes[0] as TextNode).textContent.includes(
            `module.exports`
          )
        ) {
          throwError(
            `${node.tagName} 必须含有模块导出，如 module.exports = e.g.`
          );
        }
      }
    },
  });
};
