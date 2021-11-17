import chalk from "chalk";
import Koa, { Context } from "koa";
import Router from "koa-router";
import Body from "koa-body";
import Logger from "koa-logger";
import websockify from "koa-websocket";
import { Result } from "./result/Result";
import { configHandleError } from "./tool/validate";
import { ParameterError } from "./error";
import cors from "koa-cors";
import { codeRouter } from "./routes/code";
import { userRouter } from "./routes/user";
import { check } from "./tool/jwt";
import { getUserById } from "./mapper/user";
import { Player } from "./game/player";
import { initPlayerActions } from "./game/action";

initPlayerActions();

const PORT = 10006;

const __app = new Koa({
  proxy: true,
});

__app.use(cors());

export const _app = new Router({
  prefix: '/server10006'
});

__app.use(_app.routes());

const app = websockify(__app);

app.ws.use(async ctx => {
  try {
    const token = ctx.request.url.split('token=')[1];
    if (!token) ctx.websocket.close(undefined, '未登录');
    const { id } = check(token);
    const user = await getUserById(id);
    new Player(ctx.websocket, user);
  } catch (e) {
    console.error(e);
    ctx.websocket.close(undefined, 'Server Error');
  }
})

_app.use(Logger());
_app.use(Body());

configHandleError(async result => {
  throw new ParameterError(result);
})

_app.use(async function (ctx, next) {
  try {
    const result = await next() as Result;
    handleSuccess(ctx as unknown as Context, result);
  } catch (e: any) {
    handleError(ctx as unknown as Context, e);
  }
});


_app.use(codeRouter.routes());
_app.use(userRouter.routes());

function handleSuccess(ctx: Context, result?: Result) {
  if (result) {
    ctx.status = 200;
    ctx.message = 'success';
    ctx.body = {
      code: result.code,
      message: result.message,
      data: result.data
    }
  } else {
    ctx.status = 404;
    ctx.message = 'Page not found.';
  }
}
function handleError(ctx: Context, e: any) {
  console.error(e);
  ctx.status = e.acode ?? 500;
  ctx.body = {
    status: ctx.status,
    message: e.amsg ?? 'Server error, try again later.'
  };
}


__app.listen(PORT);
console.log(chalk.green(`Server start on port ${PORT}`));