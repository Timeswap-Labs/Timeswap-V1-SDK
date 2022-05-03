import invariant from 'tiny-invariant';
import { CP, Due } from '../entities';
import { Uint16, Uint256, Uint112, Uint40 } from '../uint';
import { mulDivUp } from './fullMath';
import { divUp, shiftRightUp } from './math';
import { sqrtUp } from './squareRoot';
import timeswapMath from './timeswapMath';

const BASE = new Uint256(0x10000000000);

export function givenDebt(
  fee: Uint16,
  protocolFee: Uint16,
  cp: CP,
  maturity: Uint256,
  assetOut: Uint112,
  debtIn: Uint112,
  now: Uint256
): BorrowResult {
  const xDecrease = getX(maturity, assetOut, fee, protocolFee, now);

  const xReserve = new Uint256(cp.x);
  xReserve.subAssign(xDecrease);

  const _yIncrease = new Uint256(debtIn);
  _yIncrease.subAssign(xDecrease);
  _yIncrease.shlAssign(32);
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  _yIncrease.divAssign(denominator);
  const yIncrease = new Uint112(_yIncrease);

  const yReserve = new Uint256(cp.y);
  yReserve.addAssign(_yIncrease);

  const zReserve = new Uint256(cp.x);
  zReserve.mulAssign(cp.y);
  denominator.set(xReserve);
  denominator.mulAssign(yReserve);
  zReserve.set(mulDivUp(zReserve, new Uint256(cp.z), denominator));

  const _zIncrease = new Uint256(zReserve);
  _zIncrease.subAssign(cp.z);
  const zIncrease = new Uint112(_zIncrease);

  return { xDecrease, yIncrease, zIncrease };
}

export function givenCollateral(
  fee: Uint16,
  protocolFee: Uint16,
  cp: CP,
  maturity: Uint256,
  assetOut: Uint112,
  collateralIn: Uint112,
  now: Uint256
): BorrowResult {
  const xDecrease = getX(maturity, assetOut, fee, protocolFee, now);

  const xReserve = new Uint256(cp.x);
  xReserve.subAssign(xDecrease);

  const _zIncrease = new Uint256(collateralIn);
  _zIncrease.subAssign(1);
  _zIncrease.mulAssign(xReserve); // bug
  const subtrahend = new Uint256(cp.z);
  subtrahend.mulAssign(xDecrease);
  _zIncrease.subAssign(subtrahend);
  _zIncrease.shlAssign(25);
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.mulAssign(xReserve);
  _zIncrease.divAssign(denominator);
  const zIncrease = new Uint112(_zIncrease);

  const zReserve = new Uint256(cp.z);
  zReserve.addAssign(_zIncrease);

  const yReserve = new Uint256(cp.x);
  yReserve.mulAssign(cp.z);
  denominator.set(xReserve);
  denominator.mulAssign(zReserve);
  yReserve.set(mulDivUp(yReserve, new Uint256(cp.y), denominator));

  const _yIncrease = new Uint256(yReserve);
  _yIncrease.subAssign(cp.y);
  const yIncrease = new Uint112(_yIncrease);

  return { xDecrease, yIncrease, zIncrease };
}

export function givenPercent(
  fee: Uint16,
  protocolFee: Uint16,
  cp: CP,
  maturity: Uint256,
  assetOut: Uint112,
  percent: Uint40,
  now: Uint256
): BorrowResult {
  const yIncrease = new Uint112(0);
  const zIncrease = new Uint112(0);

  const xDecrease = getX(maturity, assetOut, fee, protocolFee, now);

  const xReserve = new Uint256(cp.x);
  xReserve.subAssign(xDecrease);

  if (percent.lte(0x80000000)) {
    const yMin = new Uint256(xDecrease);
    yMin.mulAssign(cp.y);
    yMin.set(divUp(yMin, xReserve));
    yMin.set(shiftRightUp(yMin, new Uint256(4)));

    const yMid = new Uint256(cp.y);
    yMid.mulAssign(cp.y);
    yMid.set(mulDivUp(yMid, new Uint256(cp.x), xReserve));
    yMid.set(sqrtUp(yMid));
    yMid.subAssign(cp.y);

    const _yIncrease = new Uint256(yMid);
    _yIncrease.subAssign(yMin);
    _yIncrease.mulAssign(percent);
    _yIncrease.set(shiftRightUp(_yIncrease, new Uint256(31)));
    _yIncrease.addAssign(yMin);
    yIncrease.set(_yIncrease);

    const yReserve = new Uint256(cp.y);
    yReserve.addAssign(_yIncrease);

    const zReserve = new Uint256(cp.x);
    zReserve.mulAssign(cp.y);
    const denominator = new Uint256(xReserve);
    denominator.mulAssign(yReserve);
    zReserve.set(mulDivUp(zReserve, new Uint256(cp.z), denominator));

    const _zIncrease = new Uint256(zReserve);
    _zIncrease.subAssign(cp.z);
    zIncrease.set(_zIncrease);
  } else {
    percent.set(new Uint40(0x100000000).sub(percent));

    const zMid = new Uint256(cp.z);
    zMid.mulAssign(cp.z);
    zMid.set(mulDivUp(zMid, new Uint256(cp.x), xReserve));
    zMid.set(sqrtUp(zMid));
    zMid.subAssign(cp.z);

    const _zIncrease = new Uint256(zMid);
    _zIncrease.mulAssign(percent);
    _zIncrease.set(shiftRightUp(_zIncrease, new Uint256(31)));
    zIncrease.set(_zIncrease);

    const zReserve = new Uint256(cp.z);
    zReserve.addAssign(_zIncrease);

    const yReserve = new Uint256(cp.x);
    yReserve.mulAssign(cp.z);
    const denominator = new Uint256(xReserve);
    denominator.mulAssign(zReserve);
    yReserve.set(mulDivUp(yReserve, new Uint256(cp.y), denominator));

    const _yIncrease = new Uint256(yReserve);
    _yIncrease.subAssign(cp.y);
    yIncrease.set(_yIncrease);
  }

  return { xDecrease, yIncrease, zIncrease };
}

export function borrow(
  fee: Uint16,
  protocolFee: Uint16,
  state: CP,
  maturity: Uint256,
  xDecrease: Uint112,
  yIncrease: Uint112,
  zIncrease: Uint112,
  now: Uint256
): { assetOut: Uint256; dueOut: Due } {
  invariant(now.lt(maturity), 'E202');
  invariant(xDecrease.ne(0), 'E205');

  const {
    dueOut,
    feeStoredIncrease,
    protocolFeeStoredIncrease,
  } = timeswapMath.borrow(
    maturity,
    state,
    xDecrease,
    yIncrease,
    zIncrease,
    fee,
    protocolFee,
    now
  );

  const assetOut = new Uint256(xDecrease);
  assetOut.subAssign(feeStoredIncrease);
  assetOut.subAssign(protocolFeeStoredIncrease);

  return { assetOut, dueOut };
}

function getX(
  maturity: Uint256,
  assetOut: Uint112,
  fee: Uint16,
  protocolFee: Uint16,
  now: Uint256
): Uint112 {
  const totalFee = new Uint256(fee);
  totalFee.addAssign(protocolFee);

  const numerator = new Uint256(maturity);
  numerator.subAssign(now);
  numerator.mulAssign(totalFee);
  numerator.addAssign(BASE);

  const _xDecrease = new Uint256(assetOut);
  _xDecrease.mulAssign(numerator);
  _xDecrease.set(divUp(_xDecrease, BASE));
  const xDecrease = new Uint112(_xDecrease);

  return xDecrease;
}

export interface BorrowResult {
  xDecrease: Uint112;
  yIncrease: Uint112;
  zIncrease: Uint112;
}

export default {
  givenDebt,
  givenCollateral,
  givenPercent,
  borrow,
};
