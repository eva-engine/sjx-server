import Router from "koa-router";
import { emailController } from "../controller/mail";
import { ResourceError } from "../error";
import { getRankByUserId, getUserByEmail, getUserById, getUserByUname, getUsersOrderByRank, insertUser, updateUser } from "../mapper/user";
import { InsertUser, TempleteUser, User } from "../po/user";
import { Result } from "../result/Result";
import { randomHexStr } from "../tool/generate/random";
import { create, loginRequired } from "../tool/jwt";
import { encryptPassword } from "../tool/secret";
import { loginEmailValidator, loginPasswordValidator, updateUserValidator } from "../validator/user";

export const userRouter = new Router({
  prefix: '/user'
});

function createUser(): TempleteUser {
  return {
    createTime: (Date.now() / 1000) | 0,
    updateTime: (Date.now() / 1000) | 0,
    uname: '闪箭侠' + randomHexStr(8),
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
  delete user.upass;
  return Result.withData({
    user,
    token
  });
});

userRouter.post('/login/password', loginPasswordValidator, async ctx => {
  const { upass, uname } = ctx.request.body;
  const user = await getUserByUname(uname);
  if (!user) {
    throw new ResourceError('用户名不存在');
  }
  if (!user.upass) {
    throw new ResourceError('该用户还未设置密码，请用邮箱验证码登录');
  }
  const checked = encryptPassword(upass);
  if (checked === user.upass) {
    const token = create(user.id, user.email);
    delete user.upass;
    return Result.withData({
      user,
      token
    });
  }
});

userRouter.post('/register', loginPasswordValidator, async ctx => {
  const { upass, uname } = ctx.request.body;
  let existUser = await getUserByUname(uname);
  if (existUser) {
    throw new ResourceError('用户名已存在');
  }
  const checked = encryptPassword(upass);
  const _user = createUser();
  _user.uname = uname ?? _user.uname;
  _user.upass = checked;
  const { insertId } = await insertUser(_user as InsertUser);
  const user = await getUserById(insertId);
  const token = create(user.id, user.email);
  delete user.upass;
  return Result.withData({
    user,
    token
  });
});

userRouter.post('/login/token', loginRequired, async ctx => {
  const { id, email } = ctx;
  const token = create(id, email);
  const user = await getUserById(id);
  delete user.upass;
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
  delete user.upass;
  return Result.withData(updatedUser);
});

userRouter.post('/list/rank', loginRequired as any, updateUserValidator, async ctx => {
  const { id } = ctx;
  const { from, to } = ctx.request.body;
  const rank = await getRankByUserId(id);
  const ranks = await getUsersOrderByRank(from, to);

  return Result.withData({ rank, ranks });
});
