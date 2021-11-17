import type { RoomJson, RoomOptions } from "./room";

export enum ToSType {
  In = 0,     // 加入房间
  Ready = 1,  // 准备/房主开局
  Turn = 2,   // 游戏操作，暂存等下一逻辑帧flush
  Watch = 3,  // 加入观战
  Create = 4, // 创建房间
  Record = 5, // 对局记录 
  Kill = 6    // 游戏中杀死敌人
}
export enum ToBType {
  Room = 0,     // 广播room状态
  Error = 1,    // 操作失败
  Begin = 2,    // 对局开始信号
  Flush = 3     // 上个逻辑帧的缓冲信息
}
export type MessageType = ToSType | ToBType;

export type GameEvent = {};

export type MessageStruct<T extends MessageType = MessageType, D extends any = any> = {
  id?: number
  rid?: number  // 用来标记回复的是哪条信息
  type: T
  data: D
}

export type PlayerConfig = {
  hp: number
  atk: number
}

export type InStruct = MessageStruct<ToSType.In, {
  id: number
  token?: string
  group?: 1 | 2
  playerConfig: PlayerConfig //玩家信息，血量，攻击力...，暂时认为所有玩家是一致的
}>

export type ReadyStruct = MessageStruct<ToSType.Ready, {}>

export type TurnStruct = MessageStruct<ToSType.Turn, GameEvent>;

export type WatchStruct = MessageStruct<ToSType.Watch, {
  id: number
  token?: string
}>

export type CreateStruct = MessageStruct<ToSType.Create, {
  options: RoomOptions
  playerConfig: PlayerConfig
}>

export type RecordStruct = MessageStruct<ToSType.Record, {
  from: number
  to: number
} | {
  frames: number[]
}>

export type KillStruct = MessageStruct<ToSType.Kill, {
  enemyId: number
}>

export type RoomStruct = MessageStruct<ToBType.Room, RoomJson>

export type ErrorStruct = MessageStruct<ToBType.Error, {
  message: string
  code: number    //默认0
}>

export type BeginStruct = MessageStruct<ToBType.Begin, {
  seeds: number[] //10个随机数种子， 整数 0 --- 999999
}>

export type FlushStruct = MessageStruct<ToBType.Flush, {
  frame: number,
  events: GameEvent[]
}>