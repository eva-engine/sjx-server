import Matter from "matter-js";
import WebSocket from "ws";
import type { HomeMsgStruct, InMsgStruct, MessageStruct } from "../src/index";

export const GAME_WIDTH = 1624
export const GAME_HEIGHT = innerWidth / innerHeight * 1624

export class Robot {
  constructor(public name: string, public phone: string, public time: number = 0) {
    this.init();
  }
  ws: WebSocket
  init() {
    this.ws = new WebSocket(`wss://www.anxyser.xyz/qianserver2?name=${encodeURIComponent(this.name)}&tel=${this.phone}&time=${this.time}`);
    this.ws.onmessage = e => {
      this.onMessage(JSON.parse(e.data as string));
    }
    this.ws.onopen = e => {
      this.randomJoin();
    }
    this.ws.onclose = e => {
      this.destroy();
    }
    this.ws.onerror = e => {
      this.destroy();
    }
  }
  timer: NodeJS.Timer
  _destroyed = false
  destroy() {
    this._destroyed = true;
    clearInterval(this.timer);
    this.ws.close();
  }
  inhome = false
  randomJoin() {
    setTimeout(() => {
      if (this.inhome) return;
      this.send<InMsgStruct>({
        type: 'in',
        data: {
          maxSize: 2,
          lock: false
        }
      })
    }, 5000 * Math.random());
  }
  running = false
  onMessage(msg: MessageStruct) {
    switch (msg.type) {
      case 'home': {
        const { running, users } = msg.data as HomeMsgStruct['data'];
        if (running) {
          this.running = true;
        }
        break;
      }
      case 'error': {
        this.running = false;
        this.randomJoin();
        break;
      }
    }
  }
  x = GAME_WIDTH / 2
  y = 470
  world = Matter.World.create({
    gravity: {
      y: 0,
      x: 0,
      scale: 1
    }
  })
  engine = Matter.Engine.create({
    gravity: {
      y: 0,
      x: 0,
      scale: 1
    }
  })
  body = Matter.Bodies.rectangle(this.x, this.y, 200, 44, {
    restitution: 0,
    frictionAir: 0,
    friction: 0,
    frictionStatic: 0,
    collisionFilter: {
      group: -1
    },
    isStatic: true,
  })
  onTime() {
    if (this.running) return;
    Matter.Engine.update(this.engine, 16.6);
    Matter.Body.setPosition(this.body, {
      x: this.x, y: this.y
    });
    
  }
  send<T extends MessageStruct>(msg: T) {
    this.ws.send(JSON.stringify(msg));
  }
}