import { expect } from "../tool/validate";
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