import { throwError } from "../common";
import { checkValidate } from "./check";
import { TextNode, CommentNode, ElementNode, RootNode } from "./nodes";
import { token } from "./token";
import { TYPES, BaseNode, NODE_TYPES } from "./type";

export const parse = (str: string) => {
  function ensureValidNode() {
    if (!node) {
      throwError("Unexpected null node");
    }
  }

  const root: RootNode = {
    type: NODE_TYPES.ROOT,
    childNodes: [],
  };

  let parent: RootNode | ElementNode = root;
  let node: BaseNode | ElementNode | null = null;
  let attributeName = "";

  const stateMachine = {
    [TYPES.TEXT](text: string) {
      parent.childNodes.push(new TextNode(text, parent));
    },
    [TYPES.TAG_OPEN](text: string, closing: boolean) {
      if (closing) {
        const tagName = (parent as any)?.tagName;
        if (text !== tagName) {
          console.info(`${tagName} 与 ${text}不一致，将被替换为 ${tagName}`);
        }
        return;
      }

      node = new ElementNode({ tagName: text });
    },
    [TYPES.TAG_CLOSE](closing: boolean, selfClosing: boolean) {
      if (attributeName) {
        (node as ElementNode).attributes[attributeName] = true;
        attributeName = "";
      }
      if (closing && selfClosing) {
        throwError("Unexpected closing with selfClosing. e.g. </tag />");
      }

      if (selfClosing) {
        // 防止 < />的出现
        ensureValidNode();
        (node as ElementNode).selfClosing = true;
        parent.childNodes.push(node as ElementNode);
        node = null;
        return;
      }

      if (closing) {
        node = parent as ElementNode;
        // < />出现在 root 的直接子元素， 会导致 node 为空
        parent = (node!.parentNode as any) || root;
        (node as ElementNode).closing = true;
        return;
      }

      parent.childNodes.push(node as ElementNode);
      node!.parentNode = (parent as BaseNode) || (root as any);
      parent = node as ElementNode;
      node = null;
    },
    [TYPES.ATTRIBUTE_NAME](text: string) {
      attributeName = text;
      (node as ElementNode).attributes[attributeName] = true;
    },
    [TYPES.ATTRIBUTE_VALUE](text: string) {
      (node as ElementNode).attributes[attributeName] = text;
      attributeName = "";
    },
    [TYPES.COMMENT](comment: string) {
      parent.childNodes.push(new CommentNode(comment));
    },
  };

  function traverse(type: TYPES, ...args: Array<string | boolean>) {
    const action = stateMachine[type as keyof typeof stateMachine];
    // @ts-ignore
    action(...args);
  }

  token(str, traverse, () => ({ node, parent }));

  checkValidate(root);

  return root;
};
