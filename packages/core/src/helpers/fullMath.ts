import { Uint256 } from '../uint';

export function mulDiv(a: Uint256, b: Uint256, denominator: Uint256): Uint256 {
  return new Uint256((a.toBigInt() * b.toBigInt()) / denominator.toBigInt());
}

export function mulDivUp(
  a: Uint256,
  b: Uint256,
  denominator: Uint256
): Uint256 {
  const z = mulDiv(a, b, denominator);
  const mulMod = (a.toBigInt() * b.toBigInt()) % denominator.toBigInt();
  if (mulMod > 0n) return z.add(1);
  else return z;
}
