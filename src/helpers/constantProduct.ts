import { State, Uint256 } from '..';
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
