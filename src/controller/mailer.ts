import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { readFileSync } from "fs";

const pass = readFileSync('./etoken', 'utf8').trim();
export async function sendMail(receiver: string, title: string, content: string): Promise<SMTPTransport.SentMessageInfo> {
  const transfor = createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    service: 'qq',
    auth: {
      user: '2219927527@qq.com',
      pass,
    }
  });
  const mail = {
    from: {
      name: '闪箭之城',
      address: '2219927527@qq.com'
    },
    to: receiver,
    subject: title,
    text: content
  };
  return new Promise((resolve, reject) => {
    transfor.sendMail(mail, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    })
  })
}