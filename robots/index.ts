import { Robot } from "./robot";
import { randomName } from "./utils";

const OnLineCOunt = 1;

const robots: Robot[] = [];
for (let i = 0; i < OnLineCOunt; i++) {
  const robot = new Robot(randomName(), '13461816134');
  robots.push(robot);
}

setInterval(() => {
  for (const robot of robots) {
    try {
      robot._destroyed || robot.onTime();
    } catch(e) {
      console.error(e);
    }
  }
}, 16.6);