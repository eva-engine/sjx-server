import chalk from "chalk";
import { expect, configHandleError } from ".";
import type { Validator } from "./core";

configHandleError(async msg => console.log(chalk.red(msg)));

const ctx = {
  request: {
    body: {}
  }
};

function setBody(value: any) {
  ctx.request.body = value;
}
async function final() {
  console.log(chalk.green('success'));
};
async function test(body: any, validator: Validator) {
  setBody(body);
  await validator(ctx, final);
}

(async () => {

  test({}, expect());

  test({ a: 123123 }, expect({ a: 'isNumber' }));

  test({ b: !!2, a: 2131231 }, expect({ b: 'isBoolean', a: ['isInt', ['in', [2131231, 123, 23, 123, 123]]] }));

  test({ a: true, b: 'abssssss' }, expect('a').isBoolean().expect('b').in(['abss', 'absssss']));

})()