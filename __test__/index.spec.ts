import { genValueStr } from "../src/lib/generate";
import { parse, generate, traverse, NODE_TYPES } from "../src/lib/index";
import { ElementNode, TextNode } from "../src/lib/parse/nodes";

describe(`测试公共函数`, () => {
  it(`测试genValueStr 不压缩`, () => {
    const str = genValueStr("wx:if", "isShow", false);
    const bindStr = genValueStr("bind:tap", "{{showMessage}}", false);
    const propStr = genValueStr("class", "isShow {{className}}", false);

    expect(str).toStrictEqual(`wx:if="{{ isShow }}"`);
    expect(bindStr).toStrictEqual(`bind:tap="showMessage"`);
    expect(propStr).toStrictEqual(`class="isShow {{ className }}"`);
  });

  it(`测试genValueStr 压缩`, () => {
    const str = genValueStr("wx:if", "isShow", true);
    const bindStr = genValueStr("bind:tap", "{{ showMessage  }}", true);
    const propStr = genValueStr("class", "isShow {{className}}", true);

    expect(str).toStrictEqual(`wx:if="{{isShow}}"`);
    expect(bindStr).toStrictEqual(`bind:tap="showMessage"`);
    expect(propStr).toStrictEqual(`class="isShow {{className}}"`);
  });
});

describe(`测试 ast 功能`, () => {
  it(`单标签`, () => {
    const ast = parse(`<view>this is a view</view>`);
    expect(ast.type === NODE_TYPES.ROOT).toStrictEqual(true);
    expect(ast.childNodes.length === 1).toStrictEqual(true);

    const node = ast.childNodes[0] as ElementNode;
    expect(node.tagName === "view").toStrictEqual(true);
  });

  it(`多标签`, () => {
    const ast = parse(`<view>this is a view</view><text>this is a text</text>`);
    expect(ast.type === NODE_TYPES.ROOT).toStrictEqual(true);
    expect(ast.childNodes.length === 2).toStrictEqual(true);

    const node = (ast.childNodes[1] as ElementNode).childNodes[0] as TextNode;
    expect(node.textContent.trim() === "this is a text").toStrictEqual(true);
  });

  it(`非法标签，未正确闭合`, () => {
    try {
      parse(`<view>this is a view</text>`);
    } catch (err) {
      expect(err.message).toBeTruthy();
    }
  });

  it(`非法 wxs 标签，没有module属性`, () => {
    try {
      parse(`<wxs>this is a view</wxs>`);
    } catch (err) {
      expect(err.message).toBeTruthy();
    }
  });

  it(`非法 wxs 标签，没有进行导出`, () => {
    try {
      parse(`<wxs>this is a view</wxs>`);
    } catch (err) {
      expect(err.message).toBeTruthy();
    }
  });
});

describe(`压缩代码，美化代码`, () => {
  it(`压缩代码`, () => {
    const ast = parse(`<view>
    this is a view</view>
    <text>this is text</text>`);
    const str = generate(ast, { compress: true });
    expect(str).toStrictEqual(
      `<view>this is a view</view><text>this is text</text>`
    );
  });

  it(`美化代码`, () => {
    const ast = parse(`<view>
    this is a view</view>
    <text>this is text</text>`);
    const str = generate(ast, { compress: false });
    expect(str).toStrictEqual(
      `<view>this is a view</view>
<text>this is text</text>`
    );
  });

  it(`补全 wx: 相关属性值`, () => {
    const ast = parse(
      `<view wx:if="dsa" wx:else wx:for="{{sda}}">this is a view</view>`
    );
    const str = generate(ast, { compress: false });
    expect(str).toStrictEqual(
      `<view wx:if="{{ dsa }}" wx:else wx:for="{{ sda }}">this is a view</view>`
    );
  });

  it(`去掉 bind 或 catch 绑定事件多余的{{}}`, () => {
    const ast = parse(
      `<view bindtap="open" catchtouchmove="{{close}}">this is a view</view>`
    );
    const str = generate(ast, { compress: false });
    expect(str).toStrictEqual(
      `<view bindtap="open" catchtouchmove="close">this is a view</view>`
    );
  });
});

describe(`测试 traverse `, () => {
  const ast = parse(`<view>this is a view</view>额外的文本`);
  it(`traverse 单层`, () => {
    traverse(ast, {
      [NODE_TYPES.ELEMENT](node) {
        expect(node.tagName === "view").toBeTruthy();
      },
      [NODE_TYPES.TEXT](node) {
        expect(node.textContent).toStrictEqual(`额外的文本`);
      },
    });
  });

  it(`traverse 嵌套`, () => {
    traverse(ast, {
      [NODE_TYPES.ELEMENT](node) {
        traverse(node, {
          [NODE_TYPES.TEXT](node) {
            expect(node.textContent).toBeTruthy();
          },
        });
      },
    });
  });
});
