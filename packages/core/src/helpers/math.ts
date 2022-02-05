import { Uint256 } from '../uint';

export function divUp(x: Uint256, y: Uint256): Uint256 {
  const z = x.div(y);
  if (x.mod(y).toBigInt() > 0n) z.addAssign(1);
  return z;
}

export function shiftRightUp(x: Uint256, y: Uint256): Uint256 {
  const z = x.shiftRight(y);
  if (x !== z.shiftLeft(y)) z.addAssign(1);
  return z;
}
