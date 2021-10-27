const RandomChar = '我你爱喜欢豆腐饼干来打人走吧猫狗鸡鸭子父亲老黑0123456789'
const RandomLength = RandomChar.length;
function randomChar() {
  return RandomChar[(Math.random() * RandomLength) | 0];
}
export function randomName() {
  return Array.from(new Array((Math.random() * 9 + 2) | 0), _ => randomChar()).join();
}