import { expect } from "../tool/validate";
import { checkFailure, checkSuccess, checkSymbol } from "../tool/validate/symbol";
export const loginEmailValidator = expect({
  email: 'isString',
  code: [
    'isString', ['len', [4, 4]]
  ],
  uname: [
    'nullable', ['len', [2, 18]]
  ]
});

export const updateUserValidator = expect({
  uname: [
    'nullable', ['len', [2, 18]]
  ],
  custom: [
    'nullable', 'isString'
  ]
});

export const loginPasswordValidator = expect({
  uname: [
    ['len', [2, 18]]
  ],
  upass: [
    ['len', [6, 18]]
  ]
});

export const queryValidator = expect({
  from: [
    ['default', 0], 'isInt',
  ],
  to: [
    ['default', 50], 'isInt',
  ]
}).custom(v => v.from - v.to > 100 ? checkFailure : checkSuccess, '查询数据不得超过100条');