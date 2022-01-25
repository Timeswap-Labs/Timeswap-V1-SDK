import invariant from 'tiny-invariant';
import { CP, Due } from '../entities';
import { Uint16, Uint256, Uint112, Uint40, Uint128 } from '../uint';
import { checkConstantProduct } from './constantProduct';
import { mulDivUp } from './fullMath';
import { divUp, shiftRightUp } from './math';
import { sqrtUp } from './squareRoot';

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

  const xAdjust = new Uint256(cp.x);
  xAdjust.subAssign(assetOut);

  const yAdjust = new Uint256(cp.y);
  yAdjust.shiftLeftAssign(16);
  yAdjust.addAssign(_yIncrease.mul(feeBase));

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

  const xAdjust = new Uint256(cp.x);
  xAdjust.subAssign(assetOut);

  const _zIncrease = new Uint256(collateralIn);
  _zIncrease.mulAssign(xAdjust);
  const subtrahend = new Uint256(cp.z);
  subtrahend.mulAssign(assetOut);
  _zIncrease.subAssign(subtrahend);
  _zIncrease.shiftLeftAssign(25);
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.mulAssign(xAdjust);
  _zIncrease.divAssign(denominator);
  const zIncrease = new Uint112(_zIncrease);

  const zAdjust = new Uint256(cp.z);
  zAdjust.shiftLeftAssign(16);
  zAdjust.addAssign(_zIncrease.mul(feeBase));

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

  const xAdjust = new Uint256(cp.x);
  xAdjust.subAssign(assetOut);

  const yIncrease = new Uint112(0);
  const zIncrease = new Uint112(0);

  if (percent.lte(0x80000000)) {
    const yMid = new Uint256(cp.y);
    yMid.mulAssign(cp.y);
    yMid.shiftLeftAssign(32); // This
    const denominator = new Uint256(xAdjust);
    denominator.mulAssign(feeBase);
    denominator.mulAssign(feeBase);
    yMid.set(mulDivUp(yMid, new Uint256(cp.x), denominator));
    yMid.set(sqrtUp(yMid));
    const subtrahend = new Uint256(cp.y);
    subtrahend.shiftLeftAssign(16);
    subtrahend.divAssign(feeBase);
    yMid.subAssign(subtrahend);

    const yMin = new Uint256(assetOut);
    yMin.mulAssign(cp.y);
    yMin.shiftLeftAssign(12);
    denominator.set(xAdjust);
    denominator.mulAssign(feeBase);
    yMin.set(divUp(yMin, denominator));

    const _yIncrease = new Uint256(yMid);
    _yIncrease.subAssign(yMin);
    _yIncrease.mulAssign(percent);
    _yIncrease.set(shiftRightUp(_yIncrease, new Uint256(31)));
    _yIncrease.addAssign(yMin);
    yIncrease.set(_yIncrease);

    const yAdjust = new Uint256(cp.y);
    yAdjust.shiftLeftAssign(16);
    yAdjust.addAssign(_yIncrease.mul(feeBase));

    const _zIncrease = new Uint256(cp.x);
    _zIncrease.mulAssign(cp.y);
    _zIncrease.shiftLeftAssign(16);
    subtrahend.set(xAdjust);
    subtrahend.mulAssign(yAdjust);
    _zIncrease.subAssign(subtrahend);
    denominator.set(xAdjust);
    denominator.mulAssign(yAdjust);
    denominator.mulAssign(feeBase);
    _zIncrease.set(
      mulDivUp(_zIncrease, new Uint256(cp.z).shiftLeft(16), denominator)
    );
    zIncrease.set(_zIncrease);
  } else {
    const zMid = new Uint256(cp.z);
    zMid.mulAssign(cp.z);
    zMid.shiftLeftAssign(32);
    const denominator = new Uint256(xAdjust);
    denominator.mulAssign(feeBase);
    denominator.mulAssign(feeBase);
    zMid.set(mulDivUp(zMid, new Uint256(cp.x), denominator));
    zMid.set(sqrtUp(zMid));
    const subtrahend = new Uint256(cp.z);
    subtrahend.shiftLeftAssign(16);
    subtrahend.divAssign(feeBase);
    zMid.subAssign(subtrahend);

    percent.set(new Uint40(0x100000000).sub(percent));

    const _zIncrease = new Uint256(zMid);
    _zIncrease.mulAssign(percent);
    _zIncrease.set(shiftRightUp(_zIncrease, new Uint256(31)));
    zIncrease.set(_zIncrease);

    const zAdjust = new Uint256(cp.z);
    zAdjust.shiftLeftAssign(16);
    zAdjust.addAssign(_zIncrease.mul(feeBase));
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
    yIncrease.set(_yIncrease);
  }

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
  invariant(now.toBigInt() < maturity.toBigInt(), 'Expired');

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

  const maximum = new Uint256(xDecrease);
  maximum.mulAssign(state.y);
  const minimum = new Uint256(maximum);
  maximum.shiftLeftAssign(16);

  const denominator = new Uint256(xReserve);
  denominator.mulAssign(feeBase);

  maximum.set(divUp(maximum, denominator));
  invariant(yIncrease.lte(maximum), 'E214');

  minimum.shiftLeftAssign(12);
  minimum.set(divUp(minimum, denominator));

  invariant(yIncrease.gte(minimum), 'E302');
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
  _debtIn.set(shiftRightUp(_debtIn, new Uint256(32)));
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
  _collateralIn.mulAssign(zIncrease);
  _collateralIn.set(shiftRightUp(_collateralIn, new Uint256(25)));
  const minimum = new Uint256(state.z);
  minimum.mulAssign(xDecrease);
  const denominator = new Uint256(state.x);
  denominator.subAssign(xDecrease);
  minimum.set(divUp(minimum, denominator));
  _collateralIn.addAssign(minimum);
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
