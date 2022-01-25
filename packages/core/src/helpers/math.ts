import { Uint256 } from '../uint';

export function divUp(x: Uint256, y: Uint256): Uint256 {
  const z = x.div(y);
  if (x.mod(y).ne(0)) return z.add(1);
  else return z;
}

export function shiftRightUp(x: Uint256, y: Uint256): Uint256 {
  const z = x.shiftRight(y);
  if (x !== z.shiftLeft(y)) return z.add(1);
  else return z;
}
