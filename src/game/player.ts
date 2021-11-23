import { WebSocket } from "ws";
import type { User } from "../po/user";
import { ErrorStruct, MessageStruct, MessageType, PlayerConfig, ToBType, ToSType } from "./define";
import { Room } from "./room";


export interface PlayerAction<T extends ToSType> {
  (this: Player, data: MessageStruct<T>): void
}
export class Player {

  static PlayerCache = new Set<Player>()

  // 在一场对局中的阵营
  group?: 1 | 2
  playerConfig?: PlayerConfig

  live = true

  static registerAction<T extends ToSType>(type: T, action: PlayerAction<T>) {
    this.actions[type] = action as PlayerAction<ToSType>;
  }
  static actions: Partial<Record<ToSType, PlayerAction<ToSType>>> = {}
  room?: Room
  constructor(public socket: WebSocket, public user: User) {
    Player.PlayerCache.add(this);
    socket.onmessage = e => {
      try {
        const data = JSON.parse(e.data as string) as MessageStruct<ToSType>;
        const action = Player.actions[data.type];
        if (!action) return;
        action.call(this, data);
      } catch (e) {
        console.error(e);
      }
    }
    socket.onclose = e => {
      this.destroy();
    }
  }

  send<T extends MessageStruct<ToBType>>(data: T) {
    this.socket.send(JSON.stringify(data));
  }
  error(msg: string, code = 500, rid: undefined | number = undefined) {
    this.send<ErrorStruct>({
      type: ToBType.Error,
      data: {
        message: msg,
        code
      },
      rid
    })
  }
  sendRaw(data: string) {
    this.socket.send(data);
  }

  destroy() {
    this.socket.readyState < 2 && this.socket.close();
    Player.PlayerCache.delete(this);
    this.room?.deletePlayer(this);
  }

  toString() {
    return `[Player - ${this.user.id} : ${this.user.uname}]: room: ${this.room?.id ?? 'null'}`;
  }

}