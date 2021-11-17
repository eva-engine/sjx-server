import Router from "koa-router";
import { RoomController } from "../game";
import { Result } from "../result/Result";
import { loginRequired } from "../tool/jwt";
import { StrValidator } from "../validator/common";

export const gameRouter = new Router({
  prefix: '/game'
});


gameRouter.post('/room/list', loginRequired, async ctx => {
  const { from, to, type } = ctx.request.body;
  const target = type === -1 ? RoomController.rooms : type === 0 ? RoomController.lowRooms : RoomController.highRooms;
  const rooms = target.values();
  const results = [];
  for (let i = 0; i < to; i++) {
    const room = rooms.next();
    if (i < from) continue;
    if (room.done) break;
    results.push(room.value.toJson());
  }
  return Result.withData(results);
});

gameRouter.post('/room/find', StrValidator, async ctx => {
  const { value } = ctx.request.body;

  const result = [];
  for (const room of RoomController.rooms) {
    if (room.options.name.includes(value)) {
      result.push(room.toJson());
      if (result.length > 5) break;
    }
  }

  return Result.withData(result);
});