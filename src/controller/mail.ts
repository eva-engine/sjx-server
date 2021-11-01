import { ResourceError } from "../error";
import { sendMail } from "./mailer";

class EmailController {
  static ValidTime = 1000 * 60 * 30;
  static ClearInterval = 1000 * 60 * 5;
  codeMap = new Map<string, { validTime: number, value: string }>();
  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [email, { validTime }] of this.codeMap.entries()) {
        if (validTime < now) {
          this.codeMap.delete(email);
        }
      }
    }, EmailController.ClearInterval);
  }
  async sendValidateCode(email: string) {
    const code = String(~~(Math.random() * 10000)).padStart(4, '0');
    await sendMail(email, '黑白昭网-邮件验证', `您的验证码为 ${code}, 有效期为30分钟`);
    this.codeMap.set(email, {
      validTime: Date.now() + EmailController.ValidTime,
      value: code
    });
  }
  validateCode(email: string, code: string) {
    const struct = this.valid(email);
    if (struct.value !== code) throw new ResourceError('验证码错误');
  }
  private valid(email: string) {
    const struct = this.codeMap.get(email);
    if (!struct) {
      throw new ResourceError('验证码不存在');
    }
    if (struct.validTime <= Date.now()) {
      this.codeMap.delete(email);
      throw new ResourceError('验证码已过期');
    }
    this.codeMap.delete(email);
    return struct;
  }
}
export const emailController = new EmailController();