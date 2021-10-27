import { MessageStruct, InMsgStruct } from './index';
const WebSocket = require('ws');
let ws = new WebSocket("wss://www.anxyser.xyz/qianserver");

ws.onopen = () => {
  setTimeout(() => {
    console.log('in');
    send({
      type: 'in',
      data: {
        token: 'aaa'
      }
    } as InMsgStruct);
  }, 1000);
  setTimeout(nextQian, 3000);
};
ws.onmessage = (e: any) => {
  try {
    const data = JSON.parse(e.data as string);
  } catch (e) {
    console.error(e);
  }
}
function send(msg: MessageStruct) {
  try {
    ws.send(JSON.stringify(msg));
  } catch (e) {
    console.error(e);
  }
}
function nextQian() {
  let waitx = Math.random();
  setTimeout(() => {
    let startX = 750 * Math.random();
    let startY = 500 * Math.random() + 500;
    let endY = -750;
    let endX = 700 * Math.random() + 25;
    let pi = Math.PI;
    let r = pi / 2 - Math.atan((endY - startY) / (endX - startX));
    if (endX < startX) {
      r *= -1;
    }
    let force = .048 + Math.random() * .01;
    let forceY = -Math.cos(r) * force;
    let forceX = Math.sin(r) * force;
    send({
      type: 'turn',
      data: {
        position: {
          x: startX,
          y: startY
        },
        rotation: r,
        force: {
          x: forceX,
          y: forceY
        },
        userId: -1
      }
    })
    nextQian();
  }, 1500 + waitx * waitx * 500 + waitx * 100);
};