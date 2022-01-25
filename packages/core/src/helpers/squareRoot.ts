import { Uint256 } from '../uint';

export function sqrt(x: Uint256): Uint256 {
  const z = x.add(1).div(2);
  const y = new Uint256(x);
  while (z.lt(y)) {
    y.set(z);
    z.set(
      x
        .div(z)
        .add(z)
        .div(2)
    );
  }

  return y;
}

export function sqrtUp(x: Uint256): Uint256 {
  const y = sqrt(x);
  if (x.mod(y).gt(0)) y.add(1);
  return y;
}

export default { sqrt, sqrtUp };
