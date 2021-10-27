import { hall } from './hall';
import { Home, HomeMap } from './home';
import { MessageStruct, InMsgStruct, ListToSStruct, WatchToSStruct, RankToSStruct } from './index';
import * as WebSocket from "ws";
import { addScore, rankManager, reduceScore, UserItem } from './db';
import { generateToken } from './id';
export class WSUser {
  id: number
  name: string
  lastMessageTime = Date.now()
  constructor(public socket: WebSocket, public user: UserItem) {
    this.id = user.id;
    this.name = user.name;
    socket.on('message', (message: string) => {
      this.lastMessageTime = Date.now();
      try {
        this.onMessage(JSON.parse(message));
      } catch (e) {
        console.log('error: ', (e as Error).message);
        this.send({
          type: 'error',
          data: (<Error>e).message
        })
      }
    });
    socket.onclose = e => {
      this.close();
    }
    this.send({
      type: 'init',
      data: {
        id: this.id,
        homeCount: HomeMap.size,
        userCount: hall.size
      },
    });
    this.beatTimer = setInterval(() => {
      if (socket.readyState === socket.CLOSED) {
        this.close();
      }
    }, 5000);
  }

  beatTimer: NodeJS.Timer

  home?: Home
  watchingHome?: Home
  gaming: boolean = false
  onMessage(m: MessageStruct) {
    m.from = this.id;
    switch (m.type) {
      case 'in': {
        if (this.home) {
          throw new Error(`已在房间之中`);
        }
        const msg = m as InMsgStruct;
        let { token, maxSize, lock } = msg.data;
        if (!token) {
          // 快速开局
          for (const home of HomeMap.values()) {
            if (home.users.length < home.maxSize) {
              token = home.token;
              break;
            }
          }
        }
        if (!token) {
          // 创建房间
          while (HomeMap.has(token = generateToken())) { }
        }
        let home = HomeMap.get(token);
        if (!home) {
          home = new Home(token, maxSize, lock);
          HomeMap.set(token, home);
        }
        if (home.maxSize === home.users.length) {
          throw new Error(`房间已经满员`);
        }
        if (home.running && home.lock) {
          throw new Error(`房间已开局且房主设置开局后不能进入`);
        }
        home.addUser(this);
        break;
      }
      case 'out': {
        if (!this.home) return;
        this.home.removeUser(this);
        break;
      }
      case 'ready': {
        if (!this.home) return;
        this.home.ready(this);
        break;
      }
      case 'turn': {
        if (!this.home) return;
        if (!this.home.readyUser.has(this.id)) {
          throw new Error(`还未准备`);
        }
        this.home.sendAll(m);
        break;
      }
      case 'list': {
        const { from, to } = (m as ListToSStruct).data;
        if (to - from > 200) throw new Error('一次性获取太多了');
        const homes = Array.from(HomeMap.values()).slice(from, to).map(home => home.toDescription().data);
        this.send({
          type: 'list',
          data: homes,
          from: hall.size
        });
        break;
      }
      case 'watch': {
        const { join, token } = (m as WatchToSStruct).data;
        if (!join) {
          return this.watchingHome?.removeWatcher(this);
        }
        const home = HomeMap.get(token!);
        if (!home) {
          return this.send({
            type: 'watch',
            data: false
          })
        }
        home.addWatcher(this);
        break;
      }
      case 'rank': {
        const { from, to } = (m as RankToSStruct).data;
        if (to - from > 200) throw new Error('一次性获取太多了');
        const sortedData = rankManager.sortedData;
        const index = sortedData.findIndex(d => d.id === this.id) + 1;
        this.send({
          type: 'rank',
          data: {
            index,
            score: sortedData[index - 1].score,
            list: sortedData.slice(from, to).map(({ id, name, score, winTimes, failureTimes }) => ({ id, name, score, winTimes, failureTimes })),
            count: rankManager.data.length
          }
        });
        break;
      }
      case 'failure': {
        const home = this.home;
        if (!home || home.users.length !== 2) throw new Error('没在房间');
        const winer = home.users.find(user => user.id !== this.id);
        if (!winer) throw new Error('未曾设想的错误???');
        addScore(winer.user);
        reduceScore(this.user);
        home.running = false;
        home.removeUser(this);
        home.removeUser(winer);
        rankManager.save();
        break;
      }
    }
  }
  closed = false
  // 退出应用
  close() {
    if (this.closed) return;
    clearInterval(this.beatTimer);
    this.closed = true;
    if (this.home) {
      this.home.removeUser(this);
    }
    if (this.watchingHome) {
      this.watchingHome.removeWatcher(this);
    }
    hall.delete(this.id);
    this.socket.close();
  }
  send(msg: MessageStruct) {
    this.socket.send(JSON.stringify({ time: Date.now(), ...msg }));
  }
}