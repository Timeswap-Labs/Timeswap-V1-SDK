import invariant from 'tiny-invariant';
import { State, Uint112, Uint128, Uint256 } from '..';
import { mulDivUp } from './fullMath';

export function calculate(
  state: State,
  denominator1: Uint256,
  denominator2: Uint256
): Uint256 {
  return mulDivUp(
    new Uint256(state.interest.mul(state.cdp)),
    new Uint256(state.asset),
    denominator1.mul(denominator2)
  );
}

export function getConstantProduct(
  state: State,
  denominator1: Uint256,
  denominator2: Uint256
): Uint256 {
  return mulDivUp(
    new Uint256(state.interest.mul(state.cdp).shiftLeft(32)),
    new Uint256(state.asset),
    denominator1.mul(denominator2)
  );
}

export function checkConstantProduct(
  state: State,
  assetReserve: Uint112,
  interestAdjusted: Uint128,
  cdpAdjusted: Uint128
) {
  const newProd =
    interestAdjusted.value * cdpAdjusted.value * assetReserve.value;
  const oldProd =
    state.interest.value * state.cdp.shiftLeft(32).value * state.asset.value;
  invariant(newProd >= oldProd, 'Invariance');
}
