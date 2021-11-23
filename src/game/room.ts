import { RoomController } from "."
import { randomInt } from "../tool/generate/random"
import { BeginStruct, FlushStruct, GameEvent, MessageStruct, PlayerConfig, RoomJson, RoomMode, RoomOptions, RoomSize, RoomStruct, ToBType } from "./define"
import { generateID, releaseID } from "./id"
import { Player, PlayerAction } from "./player"


export const DefaultRoomOptions: RoomOptions = {
  name: '一个房间',
  mode: RoomMode.OneVsOne,
  size: RoomSize.Small,
  lock: false,
  limit: 1,
  allowWatch: true
}

export class Room {

  id: number = generateID()

  master?: Player

  options: RoomOptions

  get fullA() {
    return this.countA === this.options.limit;
  }
  get countA() {
    let i = 0;
    for (const player of this.players) {
      if (player.group === 1) i++;
    }
    return i;
  }
  get fullB() {
    return this.countB === this.options.limit;
  }
  get countB() {
    let i = 0;
    for (const player of this.players) {
      if (player.group === 2) i++;
    }
    return i;
  }
  get liveA() {
    let i = 0;
    for (const player of this.players) {
      if (player.group === 1 && player.live) i++;
    }
    return i;
  }
  get liveB() {
    let i = 0;
    for (const player of this.players) {
      if (player.group === 2 && player.live) i++;
    }
    return i;
  }

  players: Player[] = []

  readyedPlayers = new Set<number>()

  setReady(player: Player) {
    this.readyedPlayers.add(player.user.id);
    this.broadcast();
    if (player === this.master) {
      this.begin();
    }
  }

  begin() {
    if (this.options.lock) {
      let notReadyPlayers = this.players.filter(({ user: { id } }) => !this.readyedPlayers.has(id));
      notReadyPlayers.forEach(player => {
        player.error('游戏已开局，未准备者被自动踢出', 404);
        this.deletePlayer(player);
      });
    }
    this.running = true;
    this.sendAll<BeginStruct>({
      type: ToBType.Begin,
      data: {
        seeds: Array.from(new Array(10), () => randomInt(0, 1000000))
      }
    })
  }

  running = false

  preClode = false

  constructor(options: Partial<RoomOptions>) {
    this.options = Object.assign({}, DefaultRoomOptions, options);
    RoomController.add(this);
  }

  watchers: Player[] = []

  addPlayer(player: Player) {
    if (this.players.length == 0) {
      this.master = player;
    };
    this.players.push(player);
    player.room = this;
    player.live = true;
    this.broadcast();
  }
  deletePlayer(player: Player) {
    player.room = undefined;
    if (this.running && this.readyedPlayers.has(player.user.id)) {
      // 扣分
      // reduceScore(user.user);
    }
    this.readyedPlayers.delete(player.user.id);
    this.players.splice(this.players.indexOf(player), 1);
    if (player === this.master) {
      this.master = this.players[0];
    }
    if (!this.valid) {
      this.destroy();
    }
    this.broadcast();
    this.checkFinish();
  }

  checkFinish() {
    /**
    * TODO 结算优化策略 杀一人得一分/掉线扣一分/胜利队各得一分
    */
    if (this.running && (this.liveA === 0 || this.liveB === 0)) {
      // const player = this.players[0];
      // 加分
      // addScore(wsuser.user);
      // wsuser.send({
      //   type: 'out',
      //   data: {}
      // });
      for (const player of this.players) {
        this.deletePlayer(player);
      }
    }
  }

  get valid() {
    return this.players.length > 0;
  }

  private frame = 0

  readonly gameEvents: GameEvent[][] = []

  lastLogicalEvents: GameEvent[] = []

  update() {
    this.frame++;
    this.sendAll<FlushStruct>({
      type: ToBType.Flush,
      data: {
        frame: this.frame,
        events: this.lastLogicalEvents
      }
    })
    this.gameEvents.push(this.lastLogicalEvents);
    this.lastLogicalEvents = [];
  }

  broadcast() {
    this.sendAll<RoomStruct>({
      type: ToBType.Room,
      data: this.toJson()
    });
  }

  sendAll<T extends MessageStruct<ToBType>>(data: T) {
    const rawData = JSON.stringify(data);
    for (const player of this.players) {
      player.sendRaw(rawData);
    }
  }

  destroy() {
    releaseID(this.id);
    RoomController.delete(this);
    for (const w of this.watchers) {
      w.error('对局已结束');
    }
  }

  toJson(): RoomJson {
    const players: {
      id: number
      uname: string
      ready: boolean
      playerConfig: PlayerConfig
    }[] = [];

    for (const player of this.players) {
      players.push({
        id: player.user.id,
        uname: player.user.uname,
        ready: this.readyedPlayers.has(player.user.id),
        playerConfig: player.playerConfig!
      })
    }

    return {
      id: this.id,
      name: this.options.name,
      mode: this.options.mode,
      size: this.options.size,
      limit: this.options.limit,
      lock: this.options.lock,
      master: this.master?.user.id,
      allowWatch: this.options.allowWatch,
      players,
      running: this.running,
      preClose: this.preClode
    }
  }
  toString() {
    return `[Room - ${this.id}]: master: ${this.master?.user.id} - ${this.master?.user.uname}`;
  }

}