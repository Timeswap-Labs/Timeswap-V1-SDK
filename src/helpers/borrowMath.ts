import invariant from 'tiny-invariant';
import { Claims, State, Uint112, Uint128, Uint16, Uint256 } from '..';
import { Due } from '../interface';
import { Uint40 } from '../uint';
import { checkConstantProduct, getConstantProduct } from './constantProduct';
import { mulDivUp } from './fullMath';
import { divUp, shiftUp } from './math';

export function givenDebt(
  fee: Uint16,
  state: State,
  maturity: Uint256,
  assetOut: Uint112,
  debtOut: Uint112,
  now: Uint256
): BorrowResult {
  const feeBase = fee.sub(0x10000).mul(-1);

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

export function borrow(
  fee: Uint16,
  state: State,
  maturity: Uint256,
  assetOut: Uint112,
  interestIncrease: Uint112,
  cdpIncrease: Uint112,
  now: Uint256
): Due {
  invariant(now < maturity, 'Expired');

  check(state, assetOut, interestIncrease, cdpIncrease, fee);

  const debt = getDebt(maturity, assetOut, interestIncrease, now);
  const collateral = getCollateral(maturity, state, assetOut, cdpIncrease, now);

  return { debt, collateral };
}

function check(
  state: State,
  assetOut: Uint112,
  interestIncrease: Uint112,
  cdpIncrease: Uint112,
  fee: Uint16
) {
  const feeBase = new Uint128(fee.sub(0x10000).mul(-1));
  const assetReserve = state.asset.sub(assetOut);
  const interestAdjusted = adjust(interestIncrease, state.interest, feeBase);
  const cdpAdjusted = adjust(cdpIncrease, state.cdp, feeBase);
  checkConstantProduct(state, assetReserve, interestAdjusted, cdpAdjusted);

  const minimum = new Uint256(assetOut);
  minimum.mulAssign(state.interest);
  minimum.set(divUp(minimum, new Uint256(assetReserve).shiftLeft(4)));
  invariant(interestIncrease.value >= minimum.value, 'Invalid');
}

function adjust(
  increase: Uint112,
  reserve: Uint112,
  feeBase: Uint128
): Uint128 {
  const adjusted = new Uint128(reserve);
  adjusted.shiftLeftAssign(16);
  adjusted.addAssign(feeBase.mul(increase));
  return adjusted;
}

function getDebt(
  maturity: Uint256,
  assetOut: Uint112,
  interestIncrease: Uint112,
  now: Uint256
): Uint112 {
  const _debtOut = new Uint256(maturity);
  _debtOut.subAssign(now);
  _debtOut.mulAssign(interestIncrease);
  _debtOut.set(shiftUp(_debtOut, new Uint256(32)));
  _debtOut.addAssign(assetOut);
  const debtOut = new Uint112(_debtOut);

  return debtOut;
}

function getCollateral(
  maturity: Uint256,
  state: State,
  assetOut: Uint112,
  cdpIncrease: Uint112,
  now: Uint256
): Uint112 {
  const _collateralIn = new Uint256(maturity);
  _collateralIn.subAssign(now);
  _collateralIn.mulAssign(state.interest);
  _collateralIn.addAssign(new Uint256(state.asset).shiftLeft(32));
  const denominator = new Uint256(state.asset);
  denominator.subAssign(assetOut);
  denominator.mulAssign(new Uint256(state.asset).shiftLeft(32));
  _collateralIn.set(
    mulDivUp(_collateralIn, new Uint256(assetOut).mul(state.cdp), denominator)
  );
  _collateralIn.addAssign(cdpIncrease);
  const collateralIn = new Uint112(_collateralIn);

  return collateralIn;
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
