export class AnxiError extends Error {
  constructor(public amsg: string, public acode: number = 500) {
    super(amsg);
  }
}
export class PermissionError extends AnxiError {
  constructor(public amsg: string = '无权限访问') {
    super(amsg, 403);
  }
}
export class LoginStateError extends AnxiError {
  constructor(public amsg: string = '登录状态异常') {
    super(amsg, 401);
  }
}
export class ParameterError extends AnxiError {
  constructor(public amsg: string = '字段错误') {
    super(amsg, 400);
  }
}
export class ResourceError extends AnxiError {
  constructor(amsg: string = '资源不存在') {
    super(amsg, 404);
  }
}