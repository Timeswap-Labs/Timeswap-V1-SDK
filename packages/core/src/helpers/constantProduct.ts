import invariant from 'tiny-invariant';
import { CP } from '../entities';
import { Uint256, Uint112, Uint128 } from '../uint';
import { mulDivUp } from './fullMath';

export function calculate(
  state: CP,
  denominator1: Uint256,
  denominator2: Uint256
): Uint256 {
  return mulDivUp(
    new Uint256(state.y.mul(state.z)),
    new Uint256(state.x),
    denominator1.mul(denominator2)
  );
}

export function getConstantProduct(
  state: CP,
  denominator1: Uint256,
  denominator2: Uint256
): Uint256 {
  return mulDivUp(
    new Uint256(state.y.mul(state.z).shiftLeft(32)),
    new Uint256(state.x),
    denominator1.mul(denominator2)
  );
}

export function checkConstantProduct(
  state: CP,
  xReserve: Uint112,
  yAdjusted: Uint128,
  zAdjusted: Uint128
) {
  const newProd = yAdjusted.value * zAdjusted.value * xReserve.value;
  const oldProd = state.y.value * (state.z.value << 32n) * state.x.value;
  invariant(newProd >= oldProd, 'Invariance');
}
