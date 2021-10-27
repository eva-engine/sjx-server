/**
 * 本文件应视为替代数据库的User表
 */
import { createHash } from "crypto";
import { access, appendFile, readFile, writeFile } from "fs/promises";
const RANK_DATA_PATH = './rank.json';
const RANK_DATA_BACKUP_PATH = './rank.backup.json';

export type UserItem = {
  id: number,
  score: number,
  name: string,
  token: string,
  updateTime: number,
  createTime: number,
  //连胜、连败次数
  winTimes: number,
  failureTimes: number,
  tel?: string
}
export type UserData = UserItem[]
export class UserManager {

  data: UserData = []

  get sortedData() {
    return this.data.sort((a, b) => b.score - a.score);
  }

  loaded: boolean = false;
  nextID: number = -1
  async load() {
    console.log('begin load rank data ', new Date().toLocaleString());
    try {
      await access(RANK_DATA_PATH);
      let readed!: string;
      try {
        const data = readed = await readFile(RANK_DATA_PATH, 'utf-8');
        this.data = JSON.parse(data);
      } catch (e) {
        console.error(e);
        console.error('JSON.parse failure! save file for backup.');
        await appendFile(RANK_DATA_BACKUP_PATH, `${new Date().toLocaleString()}:\r\n${readed}`);
      }
    } catch {
      this.data = [];
    }
    this.nextID = (Math.max(-1, ...this.data.map(u => u.id)) + 1);
    this.loaded = true;
    console.log('finish load rank data ', new Date().toLocaleString());
  }
  async save() {
    await writeFile(RANK_DATA_PATH, JSON.stringify(this.data, undefined, 4));
  }
  get(name: string, time: number, tel: string): UserItem {
    const user = this.data.find(u => u.name === name);
    const hash = createHash('sha256');
    const token = hash.update(`${name}_%QIAN%_${time}`).digest('hex');
    if (user) {
      // 验证token
      if (token === user.token) {
        return user;
      } else if (tel === user.tel) {
        return user;
      } else {
        throw new Error('用户名已存在或联系方式不匹配');
      }
    } else {
      return this.create(name, time, token, tel);
    }
  }
  create(name: string, time: number, token: string, tel: string): UserItem {
    const user: UserItem = {
      id: this.nextID++,
      name,
      createTime: time,
      token,
      updateTime: time,
      score: 0,
      winTimes: 0,
      failureTimes: 0,
      tel
    };
    this.data.push(user);
    this.save();
    return user;
  }
}
export function addScore(user: UserItem) {
  user.failureTimes = 0;
  user.winTimes++;
  user.updateTime = Date.now();
  user.score++;
}
export function reduceScore(user: UserItem) {
  user.winTimes = 0;
  user.failureTimes++;
  user.updateTime = Date.now();
}
export const rankManager = new UserManager();