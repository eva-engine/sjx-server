import Router from "koa-router";
import { emailController } from "../controller/mail";
import { getUserByEmail, getUserById, insertUser, updateUser } from "../mapper/user";
import { InsertUser, TempleteUser, User } from "../po/user";
import { Result } from "../result/Result";
import { create, loginRequired } from "../tool/jwt";
import { loginEmailValidator, updateUserValidator } from "../validator/user";

export const userRouter = new Router({
  prefix: '/user'
});

function createUser(): TempleteUser {
  return {
    createTime: Date.now(),
    updateTime: Date.now(),
    uname: '一只可爱的闪箭侠',
    custom: '{}',
  }
}

userRouter.post('/login/email', loginEmailValidator, async ctx => {
  const { email, code, uname } = ctx.request.body;
  emailController.validateCode(email, code);
  let user: User = await getUserByEmail(email);
  if (!user) {
    const _user = createUser();
    _user.email = email;
    _user.uname = uname ?? _user.uname;
    const { insertId } = await insertUser(_user as InsertUser);
    user = await getUserById(insertId);
  }
  const token = create(user.id, email);
  return Result.withData({
    user,
    token
  });
});


userRouter.post('/login/token', loginRequired, async ctx => {
  const { id, email } = ctx;
  const token = create(id, email);
  const user = await getUserById(id);
  return Result.withData({
    user,
    token
  });
});

userRouter.post('/update', loginRequired as any, updateUserValidator, async ctx => {
  const user = ctx.request.body;
  const { id } = ctx;
  await updateUser(id, user);
  const updatedUser = await getUserById(id);
  ctx.body.data = updatedUser;
  return Result.withData(updatedUser);
});
