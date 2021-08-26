import { Uint256 } from '..';

export function mulDiv(a: Uint256, b: Uint256, denominator: Uint256): Uint256 {
  return a.mul(b).div(denominator);
}

export function mulDivUp(
  a: Uint256,
  b: Uint256,
  denominator: Uint256
): Uint256 {
  const z = mulDiv(a, b, denominator);
  const mulMod = a.mul(b).mod(denominator);
  if (mulMod.get()! > 0) return z.add(1);
  // FIXME `!` mark
  else return z;
}
