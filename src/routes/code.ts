import Router from "koa-router";
import { emailController } from "../controller/mail";
import { Result } from "../result/Result";
import { emailCodeValidator } from "../validator/email";
export const codeRouter = new Router({
  prefix: '/code'
});


codeRouter.post('/email', emailCodeValidator, async ctx => {
  await emailController.sendValidateCode(ctx.request.body.email);
  return Result.OK;
})