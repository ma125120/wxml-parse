/* eslint-disable @typescript-eslint/no-unused-vars */
import { CommentNode, ElementNode, TextNode, RootNode } from "./nodes";
import { BaseNode, NODE_TYPES } from "./type";

const fn = {
  [NODE_TYPES.ELEMENT](node: ElementNode) {},
  [NODE_TYPES.TEXT](node: TextNode) {},
  [NODE_TYPES.COMMENT](node: CommentNode) {},
  [NODE_TYPES.ROOT](node: RootNode) {},
};
type VisitorFn = Partial<typeof fn>;

export function traverse(
  node: BaseNode | BaseNode[] | RootNode,
  visitor: VisitorFn
): void {
  const exec = (n) =>
    typeof visitor[n.type] === "function" && visitor[n.type](n);

  if (Array.isArray(node)) {
    node.forEach((n) => exec(n));
  } else {
    exec(node);
    if (Array.isArray((node as ElementNode).childNodes)) {
      (node as ElementNode).childNodes.forEach((n) => exec(n));
    }
  }
}
