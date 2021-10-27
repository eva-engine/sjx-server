import type { RuleResult } from "./core";
import { Validator } from "./core";
import { BreakSignal, breakSymbol, CheckSignal, checkSymbol, SetSignal, setSymbol } from "./symbol";

function _setDefault(value: any) {
  return (obj: any) => obj === undefined ? [setSymbol, value] as SetSignal : [checkSymbol, true] as CheckSignal;
}
function _nullable(obj: any) {
  return obj === undefined ? BreakSignal : [checkSymbol, true] as CheckSignal;
}
function _isNumber(obj: any) {
  return [checkSymbol, typeof obj === 'number'] as CheckSignal;
}
function _isString(obj: any) {
  return [checkSymbol, typeof obj === 'string'] as CheckSignal;
}
function _notNull(obj: any) {
  return [checkSymbol, obj !== undefined && obj !== null] as CheckSignal;
}
function _isBoolean(obj: any) {
  return [checkSymbol, typeof obj === 'boolean'] as CheckSignal;
}
function _inArea(area: any[]) {
  return (obj: any) => [checkSymbol, area.includes(obj)] as CheckSignal;
}
function _between(area: [number, number]) {
  return (obj: any) => [checkSymbol, typeof obj === 'number' && obj >= area[0] && obj <= area[1]] as CheckSignal;
}
function _length(area: [number, number]) {
  return (obj: any) => [checkSymbol, typeof obj === 'string' && obj.length >= area[0] && obj.length <= area[1]] as CheckSignal;
}
function _max(max: number) {
  return (obj: any) => [checkSymbol, typeof obj === 'number' && obj <= max] as CheckSignal;
}
function _min(min: number) {
  return (obj: any) => [checkSymbol, typeof obj === 'number' && obj >= min] as CheckSignal;
}
function _regexp(reg: RegExp) {
  return (obj: any) => [checkSymbol, typeof obj === 'string' && reg.test(obj)] as CheckSignal;
}

export function isNumber(this: Validator, msg: string = 'The param ($) must be number type') {
  this.ctx.checkers.push([_isNumber, msg]);
  return this;
}
export function isInt(this: Validator, msg: string = 'The param ($) must be Integer') {
  this.ctx.checkers.push([(obj: any) => [checkSymbol, Number.isInteger(obj)], msg]);
  return this;
}
export function notNull(this: Validator, msg: string = 'The param ($) can not be null or undefined') {
  this.ctx.checkers.push([_notNull, msg]);
  return this;
}
export function isString(this: Validator, msg: string = 'The param ($) must be string type') {
  this.ctx.checkers.push([_isString, msg]);
  return this;
}
export function isBoolean(this: Validator, msg = 'The param ($) must be boolean type') {
  this.ctx.checkers.push([_isBoolean, msg]);
  return this;
}
export function in_(this: Validator, area: any[], msg = `The param ($) must in [${area.join(', ')}]`) {
  this.ctx.checkers.push([_inArea(area), msg]);
  return this;
}
export function between(this: Validator, area: [number, number], msg = `The param ($) must between [${area.join(', ')}]`) {
  this.ctx.checkers.push([_between(area), msg]);
  return this;
}
export function len(this: Validator, area: [number, number], msg = `The param ($)' length must between [${area.join(', ')}]`) {
  this.ctx.checkers.push([_length(area), msg]);
  return this;
}
export function max(this: Validator, value: number, msg = `The param ($) must no more than ${value}`) {
  this.ctx.checkers.push([_max(value), msg]);
  return this;
}
export function min(this: Validator, value: number, msg = `The param ($) must no less than ${value}`) {
  this.ctx.checkers.push([_min(value), msg]);
  return this;
}
export function custom(this: Validator, value: (v: any) => RuleResult, msg = `The param ($) has not a valid type`) {
  this.ctx.checkers.push([value, msg]);
  return this;
}
export function regexp(this: Validator, value: RegExp, msg = `The param ($) has not a valid type`) {
  this.ctx.checkers.push([_regexp(value), msg]);
  return this;
}
export function default_(this: Validator, obj: any, msg = `The param ($) has not a valid type`) {
  this.ctx.checkers.push([_setDefault(obj), 'you can never see this message']);
  return this;
}
export function nullable(this: Validator,) {
  this.ctx.checkers.push([_nullable, 'you can never see this message']);
  return this;
}
export function complex(this: Validator, func: (obj: any) => boolean, msg = 'parameter invalid') {
  this.complexRules.push([func, msg]);
  return this;
}