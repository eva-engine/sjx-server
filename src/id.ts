const MIN_COUNT = 1 << 15;
const IDCache = Array.from(new Array(MIN_COUNT), (v, k) => MIN_COUNT - k);
let head = 1 << 15;

export function generateID() {
  if (IDCache.length <= MIN_COUNT) {
    IDCache.unshift(++head);
  }
  return IDCache.pop()!;
}

export function releaseID(id: number) {
  IDCache.unshift(id);
}

const Item = 1 << 16;
export function generateToken() {
  const n1 = (Number(Math.random() * Item) | 0).toString(16).padStart(4, '0');
  const n2 = (Number(Math.random() * Item) | 0).toString(16).padStart(4, '0');
  return n1 + n2;
}