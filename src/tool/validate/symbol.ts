export type ComplexRule = [(obj: any) => boolean, string];

export const breakSymbol = Symbol();
export type breakSymbol = typeof breakSymbol;
export const setSymbol = Symbol();
export type setSymbol = typeof setSymbol;
export const checkSymbol = Symbol();
export type checkSymbol = typeof checkSymbol;

export type BreakSignal = [breakSymbol];
export const BreakSignal: BreakSignal = [breakSymbol];

export type SetSignal = [setSymbol, any];
export type CheckSignal = [checkSymbol, boolean];

export const checkSuccess: CheckSignal = [checkSymbol, true];
export const checkFailure: CheckSignal = [checkSymbol, false];