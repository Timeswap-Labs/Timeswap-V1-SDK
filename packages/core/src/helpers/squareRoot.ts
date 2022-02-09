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

export function sqrtUp(y: Uint256): Uint256 {
  const z = sqrt(y);
  if (y.mod(z).ne(0)) z.addAssign(1);
  return z;
}

export default { sqrt, sqrtUp };
