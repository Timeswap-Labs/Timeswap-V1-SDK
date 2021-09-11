import invariant from 'tiny-invariant';
import { CP, Due } from '../entities';
import { Uint16, Uint256, Uint112, Uint40, Uint128 } from '../uint';
import { checkConstantProduct } from './constantProduct';
import { mulDiv, mulDivUp } from './fullMath';
import { divUp, shiftUp } from './math';

export function givenDebt(
  fee: Uint16,
  cp: CP,
  maturity: Uint256,
  assetOut: Uint112,
  debtIn: Uint112,
  now: Uint256
): BorrowResult {
  const feeBase = new Uint256(0x10000).sub(fee);

  const _yIncrease = new Uint256(debtIn);
  _yIncrease.subAssign(assetOut);
  _yIncrease.shiftLeftAssign(32);
  _yIncrease.divAssign(maturity.sub(now));
  const yIncrease = new Uint112(_yIncrease);

  const yAdjust = new Uint256(cp.y);
  yAdjust.shiftLeftAssign(16);
  yAdjust.addAssign(_yIncrease.mul(feeBase));

  const xAdjust = new Uint256(cp.x);
  xAdjust.subAssign(assetOut);

  const _zIncrease = new Uint256(cp.x);
  _zIncrease.mulAssign(cp.y);
  _zIncrease.shiftLeftAssign(16);
  const subtrahend = new Uint256(xAdjust);
  subtrahend.mulAssign(yAdjust);
  _zIncrease.subAssign(subtrahend);
  const denominator = new Uint256(xAdjust);
  denominator.mulAssign(yAdjust);
  denominator.mulAssign(feeBase);
  _zIncrease.set(
    mulDivUp(_zIncrease, new Uint256(cp.z).shiftLeft(16), denominator)
  );
  const zIncrease = new Uint112(_zIncrease);

  return { yIncrease, zIncrease };
}

export function givenCollateral(
  fee: Uint16,
  cp: CP,
  maturity: Uint256,
  assetOut: Uint112,
  collateralIn: Uint112,
  now: Uint256
): BorrowResult {
  const feeBase = new Uint256(0x10000).sub(fee);

  const _zIncrease = new Uint256(collateralIn);
  const subtrahend = new Uint256(maturity);
  subtrahend.subAssign(now);
  subtrahend.mulAssign(cp.y);
  subtrahend.addAssign(new Uint256(cp.x).shiftLeft(32));
  const denominator = new Uint256(cp.x);
  denominator.subAssign(assetOut);
  denominator.mulAssign(new Uint256(cp.x).shiftLeft(32));
  subtrahend.set(
    mulDiv(subtrahend, new Uint256(assetOut).mul(cp.z), denominator)
  );
  _zIncrease.subAssign(subtrahend);
  const zIncrease = new Uint112(_zIncrease);

  const zAdjust = new Uint256(cp.z);
  zAdjust.shiftLeftAssign(16);
  zAdjust.addAssign(_zIncrease.mul(feeBase));

  const xAdjust = new Uint256(cp.x);
  xAdjust.subAssign(assetOut);

  const _yIncrease = new Uint256(cp.x);
  _yIncrease.mulAssign(cp.z);
  _yIncrease.shiftLeftAssign(16);
  subtrahend.set(xAdjust);
  subtrahend.mulAssign(zAdjust);
  _yIncrease.subAssign(subtrahend);
  denominator.set(xAdjust);
  denominator.mulAssign(zAdjust);
  denominator.mulAssign(feeBase);
  _yIncrease.set(
    mulDivUp(_yIncrease, new Uint256(cp.y).shiftLeft(16), denominator)
  );
  const yIncrease = new Uint112(_yIncrease);

  return { yIncrease, zIncrease };
}

export function givenPercent(
  fee: Uint16,
  cp: CP,
  assetOut: Uint112,
  percent: Uint40
): BorrowResult {
  const feeBase = new Uint256(0x10000).sub(fee);

  const minimum = new Uint256(assetOut);
  minimum.mulAssign(cp.y);
  minimum.set(divUp(minimum, new Uint256(cp.x).shiftLeft(4)));

  const maximum = new Uint256(cp.y);
  maximum.shiftLeftAssign(16);
  maximum.mulAssign(assetOut);
  const denominator = new Uint256(cp.x);
  denominator.subAssign(assetOut);
  denominator.mulAssign(feeBase);
  maximum.divAssign(denominator);

  const _yIncrease = new Uint256(maximum);
  _yIncrease.subAssign(minimum);
  _yIncrease.mulAssign(percent);
  _yIncrease.shiftRightAssign(32);
  _yIncrease.addAssign(minimum);
  const yIncrease = new Uint112(_yIncrease);

  const yAdjust = new Uint256(cp.y);
  yAdjust.shiftLeftAssign(16);
  yAdjust.addAssign(_yIncrease.mul(feeBase));

  const xAdjust = new Uint256(cp.x);
  xAdjust.subAssign(assetOut);

  const _zIncrease = new Uint256(cp.x);
  _zIncrease.mulAssign(cp.y);
  _zIncrease.shiftLeftAssign(16);
  const subtrahend = new Uint256(xAdjust);
  subtrahend.mulAssign(yAdjust);
  _zIncrease.subAssign(subtrahend);
  denominator.set(xAdjust);
  denominator.mulAssign(yAdjust);
  denominator.mulAssign(feeBase);
  _zIncrease.set(
    mulDivUp(_zIncrease, new Uint256(cp.z).shiftLeft(16), denominator)
  );
  const zIncrease = new Uint112(_zIncrease);

  return { yIncrease, zIncrease };
}

export function borrow(
  fee: Uint16,
  state: CP,
  maturity: Uint256,
  xDecrease: Uint112,
  yIncrease: Uint112,
  zIncrease: Uint112,
  now: Uint256
): Due {
  invariant(now < maturity, 'Expired');

  check(state, xDecrease, yIncrease, zIncrease, fee);

  const debt = getDebt(maturity, xDecrease, yIncrease, now);
  const collateral = getCollateral(maturity, state, xDecrease, zIncrease, now);

  return { debt, collateral };
}

function check(
  state: CP,
  xDecrease: Uint112,
  yIncrease: Uint112,
  zIncrease: Uint112,
  fee: Uint16
) {
  const feeBase = new Uint128(0x10000).sub(fee);
  const xReserve = state.x.sub(xDecrease);
  const yAdjusted = adjust(state.y, yIncrease, feeBase);
  const zAdjusted = adjust(state.z, zIncrease, feeBase);
  checkConstantProduct(state, xReserve, yAdjusted, zAdjusted);

  const minimum = new Uint256(xDecrease);
  minimum.mulAssign(state.y);
  minimum.set(divUp(minimum, new Uint256(xReserve).shiftLeft(4)));
  invariant(yIncrease.value >= minimum.value, 'Invalid');
}

function adjust(
  reserve: Uint112,
  increase: Uint112,
  feeBase: Uint128
): Uint128 {
  const adjusted = new Uint128(reserve);
  adjusted.shiftLeftAssign(16);
  adjusted.addAssign(feeBase.mul(increase));
  return adjusted;
}

function getDebt(
  maturity: Uint256,
  xDecrease: Uint112,
  yIncrease: Uint112,
  now: Uint256
): Uint112 {
  const _debtIn = new Uint256(maturity);
  _debtIn.subAssign(now);
  _debtIn.mulAssign(yIncrease);
  _debtIn.set(shiftUp(_debtIn, new Uint256(32)));
  _debtIn.addAssign(xDecrease);
  const debtIn = new Uint112(_debtIn);

  return debtIn;
}

function getCollateral(
  maturity: Uint256,
  state: CP,
  xDecrease: Uint112,
  zIncrease: Uint112,
  now: Uint256
): Uint112 {
  const _collateralIn = new Uint256(maturity);
  _collateralIn.subAssign(now);
  _collateralIn.mulAssign(state.y);
  _collateralIn.addAssign(new Uint256(state.x).shiftLeft(32));
  const denominator = new Uint256(state.x);
  denominator.subAssign(xDecrease);
  denominator.mulAssign(new Uint256(state.x));
  denominator.shiftLeftAssign(32);
  _collateralIn.set(
    mulDivUp(_collateralIn, new Uint256(xDecrease).mul(state.z), denominator)
  );
  _collateralIn.addAssign(zIncrease);
  const collateralIn = new Uint112(_collateralIn);

  return collateralIn;
}

export interface BorrowResult {
  yIncrease: Uint112;
  zIncrease: Uint112;
}

export default {
  givenDebt,
  givenCollateral,
  givenPercent,
  borrow,
  check,
  adjust,
  getDebt,
  getCollateral,
};
