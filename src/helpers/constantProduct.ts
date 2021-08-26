import { State, Uint256 } from '..';
import { mulDivUp } from './fullMath';

export function calculate(
  state: State,
  denominator1: Uint256,
  denominator2: Uint256
): Uint256 {
  return mulDivUp(
    state.interest.mul(state.cdp),
    state.asset,
    denominator1.mul(denominator2)
  );
}

export function getConstantProduct(
  state: State,
  denominator1: Uint256,
  denominator2: Uint256
): Uint256 {
  return mulDivUp(
    state.interest.mul(state.cdp).shiftLeft(32),
    state.asset,
    denominator1.mul(denominator2)
  );
}
