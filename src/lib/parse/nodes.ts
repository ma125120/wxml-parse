import { NODE_TYPES, BaseNode } from "./type";

export type RootNode = {
  type: NODE_TYPES;
  childNodes: BaseNode[];
};

export class CommentNode extends BaseNode {
  public comment: string;

  constructor(comment: string) {
    super(NODE_TYPES.COMMENT);
    this.comment = comment;
  }

  toJSON() {
    return {
      type: this.type,
      comment: this.comment,
    };
  }
}

export class TextNode extends BaseNode {
  public textContent: string;

  constructor(text: string, parentNode) {
    super(NODE_TYPES.TEXT);
    this.textContent = text;
    this.parentNode = parentNode;
  }

  toJSON() {
    return {
      type: this.type,
      textContent: this.textContent,
    };
  }
}

export class ElementNode extends BaseNode {
  public tagName: string;
  public attributes: {
    [attrName: string]: string | true;
  };
  public childNodes: Array<ElementNode | TextNode | CommentNode>;
  public selfClosing: boolean;
  public closing: boolean;

  constructor({ tagName = "" } = {}) {
    super(NODE_TYPES.ELEMENT);
    this.tagName = tagName;
    this.attributes = {};
    this.childNodes = [];
    this.selfClosing = false;
    this.closing = false;
  }

  toJSON(): Object {
    return {
      type: this.type,
      tagName: this.tagName,
      attributes: this.attributes,
      selfClosing: this.selfClosing,
      childNodes: this.childNodes.map(function (node) {
        return node.toJSON();
      }),
    };
  }
}
