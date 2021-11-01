import { sign, verify } from "jsonwebtoken";
import { Context, Next } from "koa";
import { LoginStateError, PermissionError } from "../error";
import { randomHexStr } from "./generate/random";

const privateKey = randomHexStr(32);
export function create(id: number, email: string, validTime = 1000 * 60 * 60 * 24 * 7) {
  return sign({
    id,
    email,
    expires: validTime + Date.now()
  }, privateKey);
}

export function check(token: string) {
  return verify(token, privateKey) as Payload;
}

export async function loginRequired(ctx: Context, next: Next) {
  const token = ctx.header.token as string;
  try {
    const data = check(token);
    if (data.expires < Date.now()) throw new LoginStateError('登录信息已过期，请重新登录');
    Object.assign(ctx, data);
    return await next();
  } catch (e: any) {
    throw e.acode ? e : new LoginStateError();
  }
}

export async function rootRequired(ctx: Context, next: Next) {
  const token = ctx.header.token as string;
  try {
    const data = check(token);
    if (data.expires < Date.now()) throw new LoginStateError('登录信息已过期，请重新登录');
    if (data.email !== '2219927527@qq.com') throw new PermissionError('没有管理员权限');
    Object.assign(ctx, data);
    return await next();
  } catch (e: any) {
    throw e.acode ? e : new PermissionError();
  }
}