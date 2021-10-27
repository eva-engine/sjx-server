declare global {
  interface Payload {
    email: string,
    id: number,
    expires: number
  }
}
import "koa";
declare module "koa" {
  export interface BaseContext extends Payload { }
}