import fs from "fs";

import { parse, generate, traverse, NODE_TYPES } from "../lib/index";

// const source = fs.readFileSync("../lib/wxml/demo.wxml").toString();

// <wxs>var a = '<wxs>'</wxs>
const ast = parse(
  `<view wx:if=" sda " bindtap="{{ sda }}">123</view><wxs module="sad">var a = '<wxs>';module.exports=123</wxs>` +
    `<!--wxml-->
  <template name="staffName">
    <view>
    sadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdFirstName: {{firstName}}, LastName: {{lastName}}
    </view>
  </template>

  <template is="staffName" data="{{...staffA}}"></template>
  ` +
    `
  <!--\${node.comment}-->

  <view wx:if="{{xsda}}" class="sda {{sda}}" id="123" name="sadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasdsadasd\\"\\"" style="<view>view style</view>">

  <text id="123" name="sadasdsadasdsa" />

  <text>sads撒大苏打阿萨大<text>qqw的撒</text></text>
  </view>`
);

traverse(ast, {
  [NODE_TYPES.TEXT](node) {
    console.log(node);
  },
});

console.log(ast);

const str = generate(ast as any, {
  compress: false,
});

fs.createWriteStream("./demo.wxml").write(str);
