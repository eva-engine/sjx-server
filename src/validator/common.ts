import { expect } from "../tool/validate";

export const QueryValidator = expect('from').default(0).isNumber()
  .expect('to').default(20).isNumber()
  .complex(({ from, to }) => to - from <= 100, 'can not list datas more than 100');


export const IdValidator = expect({
  id: 'isInt'
});

export const NumberValidator = expect({
  value: 'isNumber'
});

export const IntValidator = expect({
  value: 'isInt'
});

export const StrValidator = expect({
  value: 'isString'
});

export const BooleanValidator = expect({
  value: 'isBoolean'
});