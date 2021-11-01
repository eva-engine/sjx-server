type Simplify<T> = {
  [P in keyof T]: T[P];
};

export type Nullable<T, K extends keyof T> = Simplify<
  // Partial in 可有可无键值的那部分
  // Pick 必须有的键值的那部分
  Partial<Pick<T, K>> & Pick<T, Exclude<keyof T, K>>
>;
