import { Uint256 } from '..';

export function divUp(x: Uint256, y: Uint256): Uint256 {
  const z = x.div(y);
  if (x.mod(y).get()! > 0) return z.add(1);
  else return z;
}

export function shiftUp(x: Uint256, y: Uint256): Uint256 {
  const z = x.shiftRight(y);
  if (x !== z.shiftLeft(y)) return z.add(1);
  else return z;
}
