export enum NODE_TYPES {
  ELEMENT = 1,
  TEXT = 3,
  COMMENT = 8,
  ROOT = 0,
}

export enum TYPES {
  TEXT,
  COMMENT,
  TAG_OPEN,
  TAG_CLOSE,
  ATTRIBUTE_NAME,
  ATTRIBUTE_VALUE,

  // start of mustache
  MUSTACHE_OPEN,
  MUSTACHE_CLOSE,
  // end of mustache
}

export abstract class BaseNode {
  public type: NODE_TYPES;
  public parentNode: BaseNode | null;

  constructor(type: NODE_TYPES) {
    this.type = type;
    this.parentNode = null;
  }

  abstract toJSON(): Object;
}

export type ConfigType = {
  compress?: boolean;
  maxWidth?: number;
};
