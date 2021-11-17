import { createHash } from "crypto";
export function encryptPassword(upass: string) {
  const pass = createHash('md5').update(`sjx-player:-${upass}::end`).digest('hex');
  return `#EEFFCC${pass}`;
}