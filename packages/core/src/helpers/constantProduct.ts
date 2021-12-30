import invariant from 'tiny-invariant';
import { CP } from '../entities';
import { Uint112, Uint128 } from '../uint';

export function checkConstantProduct(
  state: CP,
  xReserve: Uint112,
  yAdjusted: Uint128,
  zAdjusted: Uint128
) {
  const newProd =
    yAdjusted.toBigInt() * zAdjusted.toBigInt() * xReserve.toBigInt();
  const oldProd =
    state.y.toBigInt() * (state.z.toBigInt() << 32n) * state.x.toBigInt();
  invariant(newProd >= oldProd, 'Invariance');
}
