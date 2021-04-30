import { NOOP } from "../common";
import { TYPES } from "./type";

enum CHAR {
  LT = "<",
  GT = ">",
  EXCLAMATION = "!",
  SLASH = "/",
  MINUS = "-",
  BACK_SLASH = "\\",
  SPACE = " ",
  TABLE = "\t",
  EQUAL = "=",
  QUESTION = "?",
  SINGLE_QUOTE = "'",
  DOUBLE_QUOTE = '"',
  LINE_FEED = "\n",
  CARRIAGE_RETURN = "\r",
  // start of mustache
  BRACE_LEFT = "{",
  BRACE_RIGHT = "}",
  // end of mustache
}
enum ACTIONS {
  SPACE = "ACTIONS(SPACE)",
  LT = "ACTIONS(LT)",
  GT = "ACTIONS(GT)",
  DOUBLE_QUOTE = "ACTIONS(DOUBLE_QUOTE)",
  SINGLE_QUOTE = "ACTIONS(SINGLE_QUOTE)",
  EQUAL = "ACTIONS(EQUAL)",
  SLASH = "ACTIONS(SLASH)",
  EXCLAMATION = "ACTIONS(EXCLAMATION)",
  QUESTION = "ACTIONS(QUESTION)",
  CHAR = "ACTIONS(CHAR)",
  MINUS = "ACTIONS(MINUS)",
  BACK_SLASH = "ACTIONS(BACK_SLASH)",
  // start of mustache
  BRACE_LEFT = "ACTIONS(BRACE_LEFT)",
  BRACE_RIGHT = "ACTIONS(BRACE_RIGHT)",
  // end of mustache
}
enum STATES {
  TEXT = "STATE(TEXT)",
  TAG_OPEN = "STATE(TAG_OPEN)",
  TAG_NAME = "STATE(TAG_NAME)",
  ATTRIBUTE_NAME = "STATE(ATTRIBUTE_NAME)",
  ATTRIBUTE_VALUE = "STATE(ATTRIBUTE_VALUE)",
  COMMENT = "STATE(COMMENT)",
  // SCRIPT = "STATE(SCRIPT)",
}
const CHAR_TO_ACTIONS = {
  [CHAR.SPACE]: ACTIONS.SPACE,
  [CHAR.TABLE]: ACTIONS.SPACE,
  [CHAR.LINE_FEED]: ACTIONS.SPACE,
  [CHAR.CARRIAGE_RETURN]: ACTIONS.SPACE,
  [CHAR.LT]: ACTIONS.LT,
  [CHAR.GT]: ACTIONS.GT,
  [CHAR.DOUBLE_QUOTE]: ACTIONS.DOUBLE_QUOTE,
  [CHAR.SINGLE_QUOTE]: ACTIONS.SINGLE_QUOTE,
  [CHAR.EQUAL]: ACTIONS.EQUAL,
  [CHAR.SLASH]: ACTIONS.SLASH,
  [CHAR.EXCLAMATION]: ACTIONS.EXCLAMATION,
  [CHAR.QUESTION]: ACTIONS.QUESTION,
  [CHAR.MINUS]: ACTIONS.MINUS,
  [CHAR.BACK_SLASH]: ACTIONS.BACK_SLASH,
  // start of mustache
  [CHAR.BRACE_LEFT]: ACTIONS.BRACE_LEFT,
  [CHAR.BRACE_RIGHT]: ACTIONS.BRACE_RIGHT,
  // end of mustache
};

export const token = (input: string, traverse, getNode) => {
  const len = input.length;
  let column = 1;
  let line = 1;
  let i = 0;
  let text = "";
  let state = STATES.TEXT;
  let closing = false;
  let selfClosing = false;
  let quote;

  function addText(char: string) {
    text += char;
  }
  function ensureEmptyText() {
    if (text) {
      throw new Error("Unexpected text: " + text);
    }
  }
  function createUnexpected(state: string, action: string) {
    return function unexpected(char: string) {
      throw new Error(
        "Unexpected char `" +
          char +
          "` in state `" +
          state +
          "` with action `" +
          action +
          "`" +
          "line:" +
          line +
          ",column:" +
          column
      );
    };
  }

  // wxs内部，不支持嵌套标签，所以需要保留引号
  // 正常情况下不需要保留引号
  const getQuoteHandle = (char: string) => {
    const { parent } = getNode();
    const isWxs = parent?.tagName === "wxs";

    if (isWxs) {
      if (!quote) {
        quote = char;
        addText(char);
        return;
      }

      if (quote === char) {
        quote = "";
        addText(char);
      } else {
        addText(char);
      }
    }
  };

  const getHandleByType = () => {
    const currentType = TYPES.ATTRIBUTE_VALUE;
    const nextState = STATES.ATTRIBUTE_NAME;
    const quoteHandle = (char: string) => {
      if (!quote) {
        quote = char;
        return;
      }

      if (quote === char) {
        traverse(currentType, text);
        quote = "";
        text = "";
        state = nextState;
        return;
      }
      addText(char);
    };

    return {
      [ACTIONS.DOUBLE_QUOTE]: quoteHandle,
      [ACTIONS.SINGLE_QUOTE]: quoteHandle,
      [ACTIONS.SPACE](char: string) {
        if (quote) {
          addText(char);
          return;
        }
        if (!text) {
          // `<div id= ` or `<div id  `
          return;
        }

        traverse(currentType, text);
        text = "";
        state = nextState;
      },
      [ACTIONS.GT](char: string) {
        if (quote) {
          addText(char);
          return;
        }
        // end of a attribute value
        traverse(currentType, text);
        text = "";
        traverse(TYPES.TAG_CLOSE, closing, selfClosing);
        closing = false;
        selfClosing = false;
        state = STATES.TEXT;
      },
      [ACTIONS.BACK_SLASH]() {
        // 反斜杠，如果不做处理，比如 "name: sd\"\";style=sd"，将会被提前中断，产生错误
        if (quote && input[i + 1] === quote) {
          text += `\\` + quote;
          i++;
          column++;
        }
      },
      [ACTIONS.CHAR]: addText,
    };
  };

  const stateMachine = {
    [STATES.TEXT]: {
      [ACTIONS.CHAR](char: string) {
        addText(char);
        if (i === len - 1) {
          // the end
          traverse(TYPES.TEXT, text);
          text = "";
        }
      },
      [ACTIONS.LT](char: string) {
        // 可能处于wxs内部，所以需要判断
        const { parent } = getNode();
        const isWxs = parent.tagName === "wxs";
        if (isWxs && quote) {
          addText(char);
          return;
        }

        const nextChar = input[i + 1];
        // << 或者 <>，表示是普通文本
        if (nextChar === CHAR.LT || nextChar === CHAR.GT) {
          addText(char);
          return;
        }

        // 识别为标签，处理之前的文本，然后将其清空
        if (text) {
          traverse(TYPES.TEXT, text);
          text = "";
        }
        state = STATES.TAG_OPEN;
      },
      [ACTIONS.DOUBLE_QUOTE]: getQuoteHandle,
      [ACTIONS.SINGLE_QUOTE]: getQuoteHandle,
    },
    [STATES.TAG_OPEN]: {
      [ACTIONS.SPACE]: NOOP,
      [ACTIONS.LT]: createUnexpected("TAG_OPEN", "LT"),
      [ACTIONS.GT]: createUnexpected("TAG_OPEN", "GT"),
      [ACTIONS.SINGLE_QUOTE]: createUnexpected("TAG_OPEN", "SINGLE_QUOTE"),
      [ACTIONS.DOUBLE_QUOTE]: createUnexpected("TAG_OPEN", "DOUBLE_QUOTE"),
      [ACTIONS.EQUAL]: createUnexpected("TAG_OPEN", "EQUAL"),
      [ACTIONS.QUESTION]: createUnexpected("TAG_OPEN", "EQUAL"),
      [ACTIONS.BRACE_LEFT]: createUnexpected("TAG_OPEN", "BRACE_LEFT"),
      [ACTIONS.BRACE_RIGHT]: createUnexpected("TAG_OPEN", "BRACE_RIGHT"),
      // tagName，以上皆为歪门邪道

      [ACTIONS.CHAR](char: string) {
        closing = false;
        state = STATES.TAG_NAME;
        // 非必要，逻辑演进时，不需要检查文本
        ensureEmptyText();
        addText(char);
        // 进入 tagName 阶段
      },
      // 左斜杠/，标签闭合
      [ACTIONS.SLASH]() {
        closing = true;
        state = STATES.TAG_NAME;
      },
      // ! ，可能为注释
      [ACTIONS.EXCLAMATION](char: string) {
        if (input[i + 1] === CHAR.MINUS && input[i + 2] === CHAR.MINUS) {
          state = STATES.COMMENT;
          // Side effect!
          i += 2;
          return;
        }
        createUnexpected("TAG_OPEN", "EXCLAMATION")(char);
      },
    },
    [STATES.TAG_NAME]: {
      [ACTIONS.CHAR]: addText,
      [ACTIONS.SPACE]() {
        // 非必要
        if (!text) {
          // `< div`
          return;
        }

        // tagName结束，进入 ATTRIBUTE_NAME
        traverse(TYPES.TAG_OPEN, text, closing);
        text = "";
        state = STATES.ATTRIBUTE_NAME;
      },
      [ACTIONS.SLASH](char: string) {
        // / 闭合标签
        if (input[i + 1] === CHAR.GT) {
          selfClosing = true;
          return;
        }
        createUnexpected("TAG_NAME", "SLASH")(char);
      },
      [ACTIONS.GT]() {
        const nextState = STATES.TEXT;
        // >，标签名结束，或者是标签结束
        traverse(TYPES.TAG_OPEN, text, closing);

        traverse(TYPES.TAG_CLOSE, closing, selfClosing);
        text = "";

        // 重置 标签 相关状态
        closing = false;
        selfClosing = false;
        state = nextState;
      },
    },
    [STATES.ATTRIBUTE_NAME]: {
      [ACTIONS.SPACE]() {
        if (text) {
          traverse(TYPES.ATTRIBUTE_NAME, text);
          text = "";
        }
      },
      [ACTIONS.EQUAL]() {
        if (text) {
          // `<div id=`
          traverse(TYPES.ATTRIBUTE_NAME, text);
          text = "";
        }
        // `<div id =`
        state = STATES.ATTRIBUTE_VALUE;
      },
      [ACTIONS.SLASH](char: string) {
        if (input[i + 1] === CHAR.GT) {
          // `<div />`
          selfClosing = true;
          return;
        }
        // `<div / ` or `<div /i`
        createUnexpected("ATTRIBUTE_NAME", "SLASH")(char);
      },
      [ACTIONS.GT]() {
        if (text) {
          // `<div id>`
          traverse(TYPES.ATTRIBUTE_NAME, text);
          text = "";
        }
        // `<div id >`
        traverse(TYPES.TAG_CLOSE, closing, selfClosing);
        selfClosing = false;
        state = STATES.TEXT;
      },
      [ACTIONS.CHAR]: addText,
    },
    [STATES.ATTRIBUTE_VALUE]: getHandleByType(),
    [STATES.COMMENT]: {
      [ACTIONS.CHAR]: addText,
      [ACTIONS.MINUS](char: string) {
        if (input[i + 1] === CHAR.MINUS && input[i + 2] === CHAR.GT) {
          // Side effect!
          i += 2;
          column += 2;
          traverse(TYPES.COMMENT, text);
          text = "";
          state = STATES.TEXT;
          return;
        }
        addText(char);
      },
    },
  };

  while (i < len) {
    const char = input[i];
    const stateHandler = stateMachine[state];
    const actionType =
      char in CHAR_TO_ACTIONS
        ? CHAR_TO_ACTIONS[char as keyof typeof CHAR_TO_ACTIONS]
        : ACTIONS.CHAR;
    const action =
      actionType in stateHandler
        ? stateHandler[actionType as keyof typeof stateHandler]
        : stateHandler[ACTIONS.CHAR];
    if (action) {
      action(char);
    }

    if (char === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
    i++;
  }
};
