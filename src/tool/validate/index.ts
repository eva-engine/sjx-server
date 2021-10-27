import { createValidator, Validator } from "./core";
import { ValidatorConfig } from "./core"
export { configHandleError } from "./core";


export function except(...args: [string] | (ValidatorConfig | Validator)[]) {
  return typeof args[0] === 'string' ? createValidator().expect(args[0]) : createValidator(...args as (ValidatorConfig | Validator)[]);
}