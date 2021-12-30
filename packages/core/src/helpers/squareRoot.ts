import { Uint256 } from '../uint';

export function sqrt(y: Uint256): Uint256 {
  const z = new Uint256(0);

  if (y.gt(3)) {
    z.set(y);
    const x = y.div(2).add(1);
    while (x.lt(z)) {
      z.set(x);
      x.set(
        y
          .div(x)
          .add(x)
          .div(2)
      );
    }
  } else if (y.ne(0)) {
    z.set(1);
  }

  return z;
}

export function sqrtUp(y: Uint256): Uint256 {
  const z = sqrt(y);
  if (z.mod(y).gt(0)) z.add(1);
  return z;
}

export default { sqrt, sqrtUp };
