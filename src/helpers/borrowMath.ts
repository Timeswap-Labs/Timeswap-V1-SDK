import { State, Uint112, Uint128, Uint16, Uint256 } from '..';
import { Uint40 } from '../uint';
import { getConstantProduct } from './constantProduct';
import { mulDivUp } from './fullMath';
import { divUp } from './math';

export function givenDebt(
  fee: Uint16,
  state: State,
  maturity: Uint256,
  assetOut: Uint112,
  debtOut: Uint128,
  now: Uint256
): BorrowResult {
  const feeBase = new Uint16(0x10000);
  feeBase.subAssign(fee);

  const _interestIncrease = new Uint256(debtOut);
  _interestIncrease.subAssign(assetOut);
  _interestIncrease.shiftLeftAssign(32);
  _interestIncrease.divAssign(maturity.sub(now));
  const interestIncrease = new Uint112(_interestIncrease);

  const interestAdjust = new Uint256(state.interest);
  interestAdjust.shiftLeftAssign(16);
  interestAdjust.addAssign(_interestIncrease.mul(feeBase));

  const cdpAdjust = getConstantProduct(
    state,
    new Uint256(state.asset.sub(assetOut)),
    interestAdjust
  );

  const _cdpIncrease = new Uint256(cdpAdjust);
  _cdpIncrease.subAssign(new Uint256(state.cdp).shiftLeft(16));
  _cdpIncrease.set(divUp(_cdpIncrease, new Uint256(feeBase)));
  const cdpIncrease = new Uint112(_cdpIncrease);

  return { interestIncrease, cdpIncrease };
}

export function givenCollateral(
  fee: Uint16,
  state: State,
  maturity: Uint256,
  assetOut: Uint112,
  collateralIn: Uint112,
  now: Uint256
): BorrowResult {
  const feeBase = new Uint16(0x10000);
  feeBase.subAssign(fee);

  const subtrahend = new Uint256(maturity);
  subtrahend.subAssign(now);
  subtrahend.mulAssign(state.interest);
  subtrahend.addAssign(new Uint256(state.asset).shiftLeft(32));

  const denominator = new Uint256(state.asset);
  denominator.subAssign(assetOut);
  denominator.mulAssign(new Uint256(state.asset).shiftLeft(32));
  subtrahend.set(
    mulDivUp(subtrahend, new Uint256(assetOut.mul(state.cdp)), denominator)
  );

  const _cdpIncrease = new Uint256(collateralIn);
  _cdpIncrease.subAssign(subtrahend);
  const cdpIncrease = new Uint112(_cdpIncrease);

  const cdpAdjust = new Uint256(state.cdp);
  cdpAdjust.shiftLeftAssign(16);
  cdpAdjust.addAssign(_cdpIncrease.mul(feeBase));

  const interestAdjust = getConstantProduct(
    state,
    new Uint256(state.asset.sub(assetOut)),
    cdpAdjust
  );

  const _interestIncrease = new Uint256(interestAdjust);
  _interestIncrease.subAssign(new Uint256(state.interest).shiftLeft(16));
  _interestIncrease.set(divUp(_interestIncrease, new Uint256(feeBase)));
  const interestIncrease = new Uint112(_interestIncrease);

  return { interestIncrease, cdpIncrease };
}

export function givenPercent(
  fee: Uint16,
  state: State,
  assetOut: Uint112,
  percent: Uint40
): BorrowResult {
  const feeBase = new Uint16(0x10000);
  feeBase.subAssign(fee);

  const minimum = new Uint256(assetOut);
  minimum.mulAssign(state.interest);
  minimum.divAssign(new Uint256(state.asset).sub(assetOut).shiftLeft(4));

  const interestAdjust = new Uint256(state.asset);
  interestAdjust.mulAssign(state.interest);
  interestAdjust.shiftLeftAssign(16);
  interestAdjust.divAssign(state.asset.sub(assetOut));

  const maximum = new Uint256(interestAdjust);
  maximum.subAssign(new Uint256(state.interest).shiftLeft(16));
  maximum.set(divUp(maximum, new Uint256(feeBase)));

  const _interestIncrease = new Uint256(maximum);
  _interestIncrease.subAssign(minimum);
  _interestIncrease.mulAssign(percent);
  _interestIncrease.addAssign(minimum.shiftLeft(32));
  _interestIncrease.shiftLeftAssign(32);
  const interestIncrease = new Uint112(_interestIncrease);

  interestAdjust.set(state.interest);
  interestAdjust.shiftLeftAssign(16);
  interestAdjust.addAssign(_interestIncrease.mul(feeBase));

  const cdpAdjust = getConstantProduct(
    state,
    new Uint256(state.asset.sub(assetOut)),
    interestAdjust
  );

  const _cdpIncrease = new Uint256(cdpAdjust);
  _cdpIncrease.subAssign(new Uint256(state.cdp).shiftLeft(16));
  _cdpIncrease.set(divUp(_cdpIncrease, new Uint256(feeBase)));
  const cdpIncrease = new Uint112(_cdpIncrease);

  return { interestIncrease, cdpIncrease };
}

export interface BorrowResult {
  interestIncrease: Uint112;
  cdpIncrease: Uint112;
}

export default {
  givenDebt,
  givenCollateral,
  givenPercent,
};
