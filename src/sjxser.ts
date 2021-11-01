import chalk from "chalk";
import Koa, { Context } from "koa";
import Router from "koa-router";
import Body from "koa-body";
import Logger from "koa-logger";
import websockify from "koa-websocket";
import { Result } from "./result/Result";
import { configHandleError } from "./tool/validate";
import { ParameterError } from "./error";

const PORT = 10006;

const __app = new Koa({
  proxy: true,
});

export const _app = new Router({
  prefix: '/server10006'
});
__app.use(_app.routes());

const app = websockify(__app);

app.ws.use(async ctx => {
  // ctx.websocket.on
})

app.use(Logger());
app.use(Body());

configHandleError(async result => {
  throw new ParameterError(result);
})

app.use(async (ctx, next) => {
  try {
    const result = await next() as Result;
    handleSuccess(ctx as Context, result);
  } catch (e: any) {
    handleError(ctx as Context, e);
  }
});

function handleSuccess(ctx: Context, result: Result) {
  if ((result).isResult) {
    ctx.status = 200;
    ctx.message = 'success';
    ctx.body = {
      code: result.code,
      message: result.message,
      data: result.data
    }
  }
}
function handleError(ctx: Context, e: any) {
  console.error(e);
  ctx.status = e.acode ?? 500;
  ctx.message = e.amsg ?? 'Server error, try again later.';
  ctx.body = {
    status: ctx.status,
    message: e.amsg ?? 'Server error, try again later.'
  };
}


__app.listen(PORT);
console.log(chalk.green(`Server start on port ${PORT}`));