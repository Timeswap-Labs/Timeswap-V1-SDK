import { State, Uint112, Uint128, Uint16, Uint256, Uint40 } from '..';
import { getConstantProduct } from './constantProduct';
import { mulDiv } from './fullMath';
import { divUp } from './math';

export function givenBond(
  fee: Uint16,
  state: State,
  maturity: Uint256,
  assetIn: Uint112,
  bondOut: Uint128,
  now: Uint256
): LendResult {
  const feeBase = fee.add(0x10000);

  const _interestDecrease = new Uint256(bondOut);
  _interestDecrease.subAssign(assetIn);
  _interestDecrease.shiftLeftAssign(32);
  _interestDecrease.set(divUp(_interestDecrease, maturity.sub(now)));
  const interestDecrease = new Uint112(_interestDecrease);

  const interestAdjust = new Uint256(state.interest);
  interestAdjust.shiftLeftAssign(16);
  interestAdjust.subAssign(interestDecrease.mul(feeBase));

  const cdpAdjust = getConstantProduct(
    state,
    state.asset.add(assetIn),
    interestAdjust
  );

  const _cdpDecrease = new Uint256(state.cdp);
  _cdpDecrease.shiftLeftAssign(16);
  _cdpDecrease.subAssign(cdpAdjust);
  _cdpDecrease.divAssign(feeBase);
  const cdpDecrease = new Uint112(_cdpDecrease);

  return { interestDecrease, cdpDecrease };
}

export function givenInsurance(
  fee: Uint16,
  state: State,
  maturity: Uint256,
  assetIn: Uint112,
  insuranceOut: Uint128,
  now: Uint256
): LendResult {
  const feeBase = fee.add(0x10000);

  const subtrahend = new Uint256(maturity);
  subtrahend.subAssign(now);
  subtrahend.mulAssign(state.interest);
  subtrahend.addAssign(state.asset.shiftLeft(32));
  const denominator = new Uint256(state.asset);
  denominator.addAssign(assetIn);
  denominator.mulAssign(state.asset.shiftLeft(32));
  subtrahend.set(mulDiv(subtrahend, assetIn.mul(state.cdp), denominator));

  const _cdpDecrease = new Uint256(insuranceOut);
  _cdpDecrease.subAssign(subtrahend);
  const cdpDecrease = new Uint112(_cdpDecrease);

  const cdpAdjust = new Uint256(state.cdp);
  cdpAdjust.shiftLeftAssign(16);
  cdpAdjust.subAssign(cdpDecrease.mul(feeBase));

  const interestAdjust = getConstantProduct(
    state,
    state.asset.add(assetIn),
    cdpAdjust
  );

  const _interestDecrease = new Uint256(state.interest);
  _interestDecrease.shiftLeftAssign(16);
  _interestDecrease.subAssign(interestAdjust);
  _interestDecrease.divAssign(feeBase);
  const interestDecrease = new Uint112(_interestDecrease);

  return { interestDecrease, cdpDecrease };
}

export function givenPercent(
  fee: Uint16,
  state: State,
  assetIn: Uint112,
  percent: Uint40
): LendResult {
  const feeBase = fee.add(0x10000);

  const minimum = new Uint256(assetIn);
  minimum.mulAssign(state.interest);
  minimum.divAssign(state.asset.add(assetIn).shiftLeft(4));

  const interestAdjust = new Uint256(state.asset);
  interestAdjust.mulAssign(state.interest);
  interestAdjust.shiftLeftAssign(16);
  interestAdjust.divAssign(state.asset.add(assetIn));

  const maximum = new Uint256(state.interest);
  maximum.shiftLeftAssign(16);
  maximum.subAssign(interestAdjust);
  maximum.divAssign(feeBase);

  const _interestDecrease = new Uint256(maximum);
  _interestDecrease.subAssign(minimum);
  _interestDecrease.mulAssign(percent);
  _interestDecrease.addAssign(minimum.shiftLeft(32));
  _interestDecrease.shiftRightAssign(32);
  const interestDecrease = new Uint112(_interestDecrease);

  interestAdjust.set(state.interest);
  interestAdjust.shiftLeftAssign(16);
  interestAdjust.subAssign(_interestDecrease.mul(feeBase));

  const cdpAdjust = getConstantProduct(
    state,
    state.asset.add(assetIn),
    interestAdjust
  );

  const _cdpDecrease = new Uint256(state.cdp);
  _cdpDecrease.shiftLeftAssign(16);
  _cdpDecrease.subAssign(cdpAdjust);
  _cdpDecrease.divAssign(feeBase);
  const cdpDecrease = new Uint112(_cdpDecrease);

  return { interestDecrease, cdpDecrease };
}

export interface LendResult {
  interestDecrease: Uint112;
  cdpDecrease: Uint112;
}

export default {
  givenBond,
  givenInsurance,
  givenPercent,
};
