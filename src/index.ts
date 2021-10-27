import { hall } from './hall';
import { WSUser } from './User';
import WebSocket, { Server } from "ws";
import { UserData, rankManager } from './db';
import { IncomingMessage } from 'http';


export type ToSType = 'in' | 'out' | 'ready' | 'turn' | 'list' | 'watch' | 'rank' | 'failure';
export type ToBType = 'home' | 'error' | 'begin' | 'init' | 'list' | 'watch' | 'rank';
export type MessageType = ToBType | ToSType;
export type MessageStruct<D = unknown, T extends MessageType = MessageType> = {
  type: T,
  data: D,
  target?: number[] | 'all',
  from?: number,
  time?: number
}
export type InitToBStruct = MessageStruct<{
  id: number,
  homeCount: number,
  userCount: number
}, 'init'>

export type InMsgStruct = MessageStruct<{
  token?: string,
  maxSize?: number,
  lock?: boolean,
}, 'in'>
export type HomeMsgStruct = MessageStruct<{
  token: string,
  users: { id: number, ready: boolean, name: string }[],
  running: boolean,
  master?: number,
  masterName?: string
  lock: boolean,
  maxSize: number,
}, 'home'>

export type ListToSStruct = MessageStruct<{
  from: number,
  to: number
}, 'list'>
export type ListToBStruct = MessageStruct<HomeMsgStruct['data'][], 'list'>

export type WatchToSStruct = MessageStruct<{
  token?: string,
  join: boolean
}, 'watch'>;
export type WatchToBStruct = MessageStruct<HomeMsgStruct['data'] | false, 'watch'>;

export type RankToSStruct = MessageStruct<{
  from: number,
  to: number
}, 'rank'>;
export type RankToBStruct = MessageStruct<{
  list: UserData,
  count: number,
  index: number,
  score: number
}, 'rank'>;


declare module "./User" {
  export enum Base {
    "b" = "b"
  }
}
export * from "./User";
const server = new Server({
  port: 8081,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
  }
});
console.log('server begin on port: ', server.options.port);

(async () => {
  await rankManager.load();
  server.on('connection', (socket, req: IncomingMessage) => {
    try {
      const regrex = /name=(.+)&tel=(.*)&time=(.+)/;
      let [_, name, tel, time] = req.url!.match(regrex) as string[] ?? [];
      if (!name) throw new Error('请输入昵称');
      name = decodeURIComponent(name);
      if (name.length > 18) throw new Error('昵称应当少于18个字符');
      if (name.length < 2) throw new Error('昵称应当至少2个字符');
      const user = rankManager.get(name, Number(time), tel);
      if (hall.has(user.id)) {
        const userOnline = hall.get(user.id)!;
        if (userOnline.lastMessageTime > Date.now() - 1000 * 60) {
          userOnline.socket.close(4003, '已掉线');
          userOnline.close();
        } else if (userOnline.socket.readyState !== WebSocket.CLOSED) throw new Error('玩家已在线上');
      }
      const wsuser = new WSUser(socket, user);
      hall.set(user.id, wsuser);
    } catch (e) {
      socket.close(4003, (e as Error).message || '登录失败');
    }
  })
})()