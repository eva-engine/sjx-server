import { RoomMode } from "./define";
import { Room } from "./room";

export const RoomController = new class {


  init() {
    setInterval(() => {
      this.onTime();
    }, 16.667);
  }

  //1v1
  lowRooms = new Set<Room>()

  //5v5
  highRooms = new Set<Room>()

  rooms = new Set<Room>()

  roomMap = new Map<number, Room>()

  onTime() {
    for (const room of this.rooms) {
      if (room.running) {
        room.update();
      }
    }
  }

  add(room: Room) {
    this.rooms.add(room);
    this.roomMap.set(room.id, room);
    if (room.options.mode === RoomMode.OneVsOne) {
      this.lowRooms.add(room);
    } else {
      this.highRooms.add(room);
    }
  }

  delete(room: Room) {
    this.roomMap.delete(room.id);
    this.rooms.delete(room);
    if (room.options.mode === RoomMode.OneVsOne) {
      this.lowRooms.delete(room);
    } else {
      this.highRooms.delete(room);
    }
  }

  get(id: number) {
    return this.roomMap.get(id);
  }

}