import { addScore, reduceScore } from './db';
import { HomeMsgStruct, MessageStruct, WatchToBStruct } from './index';
import { WSUser } from './User';
export const MAX_HOME_SIZE = 10;
export const HomeMap: Map<string, Home> = new Map();
export class Home {
  master?: WSUser
  users: WSUser[] = []
  readyUser = new Set()
  running = false
  watchers: WSUser[] = []
  constructor(public token: string, public maxSize: number = 10, public lock = false) { }
  // 加入对局
  addUser(user: WSUser) {
    if (this.users.length == 0) {
      this.master = user;
    };
    this.users.push(user);
    user.home = this;
    this.broadcast();
  }
  // 退出当前对局
  removeUser(user: WSUser) {
    user.home = undefined;
    if (this.running && this.readyUser.has(user.id)) {
      reduceScore(user.user);
    }
    this.readyUser.delete(user.id);
    this.users.splice(this.users.indexOf(user), 1);
    if (user.id === this.master?.id) {
      this.master = this.users[0];
    }
    if (!this.valid) {
      HomeMap.delete(this.token);
      this.close();
    }
    this.broadcast();
    if (this.running && this.users.length === 1) {
      const wsuser = this.users[0];
      addScore(wsuser.user);
      wsuser.send({
        type: 'out',
        data: {}
      });
      this.removeUser(wsuser);
    }
  }
  addWatcher(user: WSUser) {
    user.watchingHome = this;
    this.watchers.push(user);
    const data = this.toDescription().data;
    user.send({ type: 'watch', data } as WatchToBStruct);
  }
  removeWatcher(user: WSUser) {
    user.watchingHome = undefined;
    this.watchers.splice(this.watchers.indexOf(user), 1);
  }
  ready(user: WSUser) {
    this.readyUser.add(user.id);
    this.broadcast();
    if (this.master?.id === user.id) {
      this.begin();
    }
  }
  begin() {
    if (this.lock) {
      let notReadyUsers = this.users.filter(({ id }) => !this.readyUser.has(id));
      notReadyUsers.forEach(user => {
        user.send({
          type: 'out',
          data: '游戏已开局，未准备者被自动踢出'
        });
        this.removeUser(user);
      });
    }
    this.running = true;
    this.sendAll({
      type: 'begin',
      time: Date.now()
    } as MessageStruct);

  }
  // 告知所有人，当前房间内人数，房主，是否开局
  broadcast() {
    this.sendAll(this.toDescription());
  }
  sendAll(msg: MessageStruct) {
    this.users.forEach(user => {
      user.send(msg);
    })
    this.watchers.forEach(user => {
      user.send(msg);
    })
  }
  get valid() {
    return this.users.length > 0;
  }
  toDescription(): HomeMsgStruct {
    let users = this.users.map(user => ({
      id: user.id,
      name: user.name,
      ready: this.readyUser.has(user.id)
    }));
    return {
      type: 'home',
      target: this.users.map(({ id }) => id),
      data: {
        users,
        token: this.token,
        running: this.running,
        master: this.master?.id,
        masterName: this.master?.name,
        lock: this.lock,
        maxSize: this.maxSize
      },
    };
  }
  close() {
    for (const w of this.watchers) {
      w.send({
        type: 'error',
        data: '对局已结束'
      })
    }
  }
}