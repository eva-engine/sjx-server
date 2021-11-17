import { expect } from "../tool/validate";
import { checkFailure, checkSuccess } from "../tool/validate/symbol";

export const roomListValidator = expect({
  type: [
    ['default', -1], ['in', [-1/*任何房间 */, 0/*1v1房间 */, 1/* 多人房间 */]]
  ],
  from: [
    ['default', 0], 'isInt',
  ],
  to: [
    ['default', 50], 'isInt',
  ]
}).custom(v => v.from - v.to > 100 ? checkFailure : checkSuccess, '查询数据不得超过100条');