import chalk from "chalk";
import Koa from "koa";
import Router from "koa-router";
import Body from "koa-body";
import Logger from "koa-logger";
import websockify from "koa-websocket";

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
app.use(async (ctx, next) => {
  try {
    ctx.body = {}
    await next();
    if (ctx.body.data) {
      ctx.status = 200;
      ctx.body.message = 'success';
    }
  } catch (e: any) {
    console.error(e);
    ctx.status = e.acode ?? 500;
    ctx.body = {
      status: ctx.status,
      message: e.amsg ?? 'Server error, try again later.'
    };
  }
})


__app.listen(PORT);
console.log(chalk.green(`Server start on port ${PORT}`));