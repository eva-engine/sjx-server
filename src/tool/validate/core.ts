import "koa-body";
import { between, complex, custom, default_, in_, isBoolean, isInt, isNumber, isString, len, max, min, notNull, nullable, regexp } from "./plugin";
import { breakSymbol, checkSymbol, ComplexRule, setSymbol } from "./symbol";

interface Context {
  request: Request
}
interface Request {
  body: Record<string, any>
}
interface Next {
  (): Promise<any>
}

export function expect(this: Validator, param: string) {
  const rule = {
    param,
    checkers: []
  }
  this.rules.push(rule);
  this.ctx = rule;
  return this;
}
export function configHandleError(_handler: (result: string) => Promise<any>) {
  handler = _handler;
}
let handler: (result: string) => Promise<any> = (result: string) => { throw new Error(result) };

export type RuleResult = [setSymbol, any] | [breakSymbol] | [checkSymbol, boolean];

type Methods = 'isNumber' | 'notNull' | 'isString' | 'isBoolean' | 'between' | 'isInt'
  | 'in' | 'len' | 'max' | 'min' | 'custom' | 'regexp' | 'nullable' | 'complex' | 'default';
type SingleConfig<M extends Methods = Methods> = M extends infer K ? K extends Methods ? ((Parameters<Validator[K]>['length'] extends (0 | 1) ? K : never) | [K, ...Parameters<Validator[K]>]) : never : never;
type SingleMethods<M extends Methods = Methods> = M extends infer K ? K extends Methods ? Parameters<Validator[K]>['length'] extends (0 | 1) ? K : never : never : never;

export interface ValidatorConfig {
  [key: string]: SingleConfig[] | SingleMethods
}
export type Rule = {
  param: string,
  checkers: [((obj: any) => RuleResult), string][]
}
export interface Validator {
  (ctx: Context, next: Next): Promise<void>
  ctx: Rule
  rules: Rule[],
  complexRules: ComplexRule[],
  min: typeof min;
  max: typeof max;
  in: typeof in_;
  default: typeof default_;
  between: typeof between;
  len: typeof len;
  isNumber: typeof isNumber;
  isInt: typeof isInt;
  isString: typeof isString;
  isBoolean: typeof isBoolean;
  regexp: typeof regexp;
  custom: typeof custom;
  complex: typeof complex;
  notNull: typeof notNull;
  nullable: typeof nullable;
  expect: typeof expect;
}
export function createValidator(...configs: (ValidatorConfig | Validator)[]) {
  const validator = async function (ctx: Context, next: Next) {
    const _body = ctx.request.body;
    const body: Record<string, any> = {};
    for (const rule of validator.rules) {
      const value = _body[rule.param];
      for (const checker of rule.checkers) {
        const [signal, extra] = checker[0](value);
        if (signal === setSymbol) {
          body[rule.param] = extra;
          continue;
        } else if (signal === breakSymbol) {
          break;
        } else {
          if (!extra) {
            return await handler(checker[1].replace('($)', rule.param));
          }
        }
      }
      if (rule.param in _body) {
        body[rule.param] = _body[rule.param];
      }
    };
    for (const [func, msg] of validator.complexRules) {
      if (!func(body)) return await handler(msg);
    }
    ctx.request.body = body;

    return await next();
  } as unknown as Validator;

  validator.rules = [] as Rule[];
  validator.complexRules = [] as ComplexRule[];
  validator.min = min;
  validator.max = max;
  validator.in = in_;
  validator.default = default_;
  validator.between = between;
  validator.len = len;
  validator.isNumber = isNumber;
  validator.isInt = isInt;
  validator.isString = isString;
  validator.isBoolean = isBoolean;
  validator.regexp = regexp;
  validator.custom = custom;
  validator.complex = complex;
  validator.notNull = notNull;
  validator.nullable = nullable;
  validator.expect = expect;

  for (const config of configs) {
    if (config.rules) {
      validator.rules = validator.rules.concat(config.rules as Rule[]);
    } else {
      for (const [param, rules] of Object.entries(config as ValidatorConfig)) {
        validator.expect(param);
        if (typeof rules === 'string') {
          validator[rules]();
        } else {
          for (const rule of rules) {
            if (typeof rule === 'string') {
              validator[rule]();
            } else {
              const [method, ...args] = rule;
              (validator[method] as (...args: any) => Validator)(...args);
            }
          }
        }
      }
    }
  }



  return validator as Validator;
}