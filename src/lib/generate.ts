import { BaseNode, NODE_TYPES } from "./parse/type";
import { CommentNode, ElementNode, RootNode, TextNode } from "./parse/nodes";

import { ConfigType } from "./parse/type";

const filterEmptyText = (node) =>
  !(node.type === NODE_TYPES.TEXT && !node.textContent.trim());

export const genValueStr = (key, value: true | string, compress = false) => {
  if (value === true) {
    return key;
  }

  value = value.trim();
  const space = compress ? "" : " ";
  const reg = /\{\{\s*(.+)\s*\}\}/g;
  const val = /^(bind|catch).+/g.test(key)
    ? value.replace(reg, (_, s) => s.trim())
    : /^wx\:.+/g.test(key) && !reg.test(value)
    ? `{{${space}${value}${space}}}`
    : value;

  return `${key}="${
    (compress
      ? val
      : val.replace(reg, (_, s) => `{{${space}${s.trim()}${space}}}`)) as string
  }"`;
};

function _serialize(node: BaseNode, config: ConfigType = {}, prevTab = "\n") {
  const { maxWidth = 120, compress } = config;
  let nextTab = prevTab + "\t";

  const serializeByType = {
    [NODE_TYPES.TEXT](node: TextNode): string {
      const text = node.textContent;
      if (text.trim()) return text.trim();

      return "";
    },
    [NODE_TYPES.COMMENT](node: CommentNode): string {
      if (compress) return "";

      return `<!--${node.comment}-->`;
    },
    [NODE_TYPES.ELEMENT](node: ElementNode): string {
      const tagName = node.tagName || "";
      const keys = Object.keys(node.attributes);
      const attrs = keys.map((name) => {
        return genValueStr(name, node.attributes[name], compress);
      });

      let attrsString = attrs.join(" ");
      let isBreakAttr = !compress && attrsString?.length > maxWidth;
      if (tagName === "text") {
        prevTab = "";
        nextTab = "";
        isBreakAttr = false;
      }
      const beforeEndStr = isBreakAttr ? prevTab : "";
      const beginTabEnd = beforeEndStr + ">";

      if (attrsString) {
        if (isBreakAttr) {
          attrsString = nextTab + attrs.join(nextTab);
        } else {
          attrsString = " " + attrsString;
        }
      }

      if (node.selfClosing) {
        return `<${tagName}${attrsString}${isBreakAttr ? beforeEndStr : " "}/>`;
      }

      if (node.childNodes.length) {
        const nodes = node.childNodes.filter(filterEmptyText);
        const isSingleText =
          nodes.length === 1 &&
          nodes[0].type === NODE_TYPES.TEXT &&
          (nodes[0] as TextNode).textContent?.length < maxWidth;

        let childNodesString = nodes
          .map((v) => {
            return _serialize(v, config, nextTab);
          })
          .join(compress ? "" : nextTab);
        if (!compress && childNodesString) {
          childNodesString =
            (isSingleText ? "" : nextTab) +
            childNodesString +
            (isSingleText ? "" : prevTab);
        }

        return `<${
          tagName || ""
        }${attrsString}${beginTabEnd}${childNodesString}</${tagName}>`;
      }

      return `<${tagName}${attrsString}${beginTabEnd}</${tagName}>`;
    },
    // [NODE_TYPES.CDATA_SECTION](node) {
    //   throw new Error('Implement');
    // },
  };
  if (serializeByType[node?.type]) {
    return serializeByType[node.type](node as any);
  }

  const childNodes = (node as ElementNode)?.childNodes || [];
  if (childNodes.length)
    return generate((node as ElementNode)?.childNodes, config);
}

export const generate = (
  node: BaseNode | BaseNode[] | RootNode,
  config?: ConfigType
) => {
  const { compress } = config;
  const baseTab = `\n`;
  if (Array.isArray(node) && node.length) {
    return node
      .filter(filterEmptyText)
      .map((v) => _serialize(v, config))
      .join(compress ? "" : baseTab);
  }

  return _serialize(node as any, config, baseTab);
};
