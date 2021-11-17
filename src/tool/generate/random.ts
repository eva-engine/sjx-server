export function randomHexStr4() {
  return Number((Math.random() * (2 << 15)) | 0).toString(4).padStart(4, '0');
}

export function randomHexStr(len: number) {
  let result = '';
  while (result.length < len) {
    result += randomHexStr4();
  }
  return result.slice(0, len);
}

export function randomInt(from: number, to: number) {
  return (from + (to - from) * Math.random()) | 0;
}