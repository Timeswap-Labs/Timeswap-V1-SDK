import { Uint256 } from '../uint';

export function divUp(x: Uint256, y: Uint256): Uint256 {
  const z = x.div(y);
  if (x.mod(y).toBigInt() > 0n) return z.add(1);
  else return z;
}

export function shiftRightUp(x: Uint256, y: Uint256): Uint256 {
  const z = x.shiftRight(y);
  if (x !== z.shiftLeft(y)) return z.add(1);
  else return z;
}

export function cbrt(n: Uint256): Uint256 {
  const x = new Uint256(0);
  for (const y = new Uint256(1 << 255); y.gt(0); y.shiftRightAssign(3)) {
    x.shiftLeftAssign(1);
    const z = x
      .add(1)
      .mul(x)
      .mul(3)
      .add(1);
    if (n.div(y).gte(z)) {
      n.subAssign(y.mul(z));
      x.addAssign(1);
    }
  }
  return x;
}
