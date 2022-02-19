import { Uint256 } from '../uint';

export function divUp(x: Uint256, y: Uint256): Uint256 {
  const z = x.div(y);
  if (x.mod(y).gt(0)) z.addAssign(1);
  return z;
}

export function shiftRightUp(x: Uint256, y: Uint256): Uint256 {
  const z = x.shr(y);
  if (x.ne(z.shl(y))) z.addAssign(1);
  return z;
}
