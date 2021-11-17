import { RoomController } from ".";
import { CreateStruct, ErrorStruct, InStruct, KillStruct, ReadyStruct, ToBType, ToSType, TurnStruct } from "./define"
import { Player } from "./player"
import { Room } from "./room";

export const initPlayerActions = () => {
  Player.registerAction(ToSType.In, function (data: InStruct) {
    if (this.room) {
      return this.error('玩家已在房间', data.id);
    }
    const roomId = data.data.id;
    const room = RoomController.get(roomId);
    if (!room) {
      return this.error('该房间不存在', data.id);
    }
    if (!data.data.group) {
      if (!room.fullA) {
        this.group = 1;
      } else if (!room.fullB) {
        this.group = 2;
      } else {
        return this.error('该房间已满，无法加入', data.id);
      }
    } else {
      this.group = data.data.group;
      if ((this.group === 1 && room.fullA) || (this.group === 2 && room.fullB)) {
        return this.error('该房间已满，无法加入', data.id);
      }
    }
    if (room.options.lock && room.running) {
      return this.error('房间已开局且房主设置开局后不能进入', data.id);
    }
    this.playerConfig = data.data.playerConfig;
    room.addPlayer(this);
  });

  Player.registerAction(ToSType.Create, function (data: CreateStruct) {
    const { options, playerConfig } = data.data;
    const room = new Room(options);
    this.group = 1;
    this.playerConfig = playerConfig;
    room.addPlayer(this);
  });

  Player.registerAction(ToSType.Ready, function (data) {
    if (!this.room) return this.error('不在该对局中', data.id);
    this.room.setReady(this);
  })

  Player.registerAction(ToSType.Turn, function (data: TurnStruct) {
    if (!this.room) return this.error('不在该对局中', data.id);
    this.room.lastLogicalEvents.push(data.data);
  })

  Player.registerAction(ToSType.Kill, function (data: KillStruct) {
    if (!this.room) return this.error('不在该对局中', data.id);
    
  })

  // TODO Watch

}