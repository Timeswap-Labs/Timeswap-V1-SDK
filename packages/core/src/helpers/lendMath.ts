import invariant from 'tiny-invariant';
import { Claims, CP } from '../entities';
import { Uint16, Uint256, Uint112, Uint40, Uint128 } from '../uint';
import { checkConstantProduct } from './constantProduct';
import { mulDiv } from './fullMath';
import { divUp } from './math';

export function givenBond(
  fee: Uint16,
  cp: CP,
  maturity: Uint256,
  assetIn: Uint112,
  bondOut: Uint128,
  now: Uint256
): LendResult {
  const feeBase = new Uint256(fee).add(0x10000);

  const _yDecrease = new Uint256(bondOut);
  _yDecrease.subAssign(assetIn);
  _yDecrease.shiftLeftAssign(32);
  _yDecrease.set(divUp(_yDecrease, maturity.sub(now)));
  const yDecrease = new Uint112(_yDecrease);

  const yAdjust = new Uint256(cp.y);
  yAdjust.shiftLeftAssign(16);
  yAdjust.subAssign(_yDecrease.mul(feeBase));

  const xAdjust = new Uint256(cp.x);
  xAdjust.addAssign(assetIn);

  const _zDecrease = new Uint256(xAdjust);
  _zDecrease.mulAssign(yAdjust);
  const subtrahend = new Uint256(cp.x);
  subtrahend.mulAssign(cp.y);
  subtrahend.shiftLeftAssign(16);
  _zDecrease.subAssign(subtrahend);
  const denominator = new Uint256(xAdjust);
  denominator.mulAssign(yAdjust);
  denominator.mulAssign(feeBase);
  _zDecrease.set(
    mulDiv(_zDecrease, new Uint256(cp.z).shiftLeft(16), denominator)
  );
  const zDecrease = new Uint112(_zDecrease);

  return { yDecrease, zDecrease };
}

export function givenInsurance(
  fee: Uint16,
  cp: CP,
  maturity: Uint256,
  assetIn: Uint112,
  insuranceOut: Uint128,
  now: Uint256
): LendResult {
  const feeBase = new Uint256(fee).add(0x10000);

  const xAdjust = new Uint256(cp.x);
  xAdjust.addAssign(assetIn);

  const _zDecrease = new Uint256(insuranceOut);
  _zDecrease.mulAssign(xAdjust);
  const subtrahend = new Uint256(cp.z);
  subtrahend.mulAssign(assetIn);
  _zDecrease.subAssign(subtrahend);
  _zDecrease.shiftLeftAssign(32);
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.mulAssign(cp.y);
  _zDecrease.set(divUp(_zDecrease, denominator));
  const zDecrease = new Uint112(_zDecrease);

  const zAdjust = new Uint256(cp.z);
  zAdjust.shiftLeftAssign(16);
  zAdjust.subAssign(zDecrease.mul(feeBase));

  const _yDecrease = new Uint256(xAdjust);
  _yDecrease.mulAssign(zAdjust);
  subtrahend.set(cp.x);
  subtrahend.mulAssign(cp.z);
  subtrahend.shiftLeftAssign(16);
  _yDecrease.subAssign(subtrahend);
  denominator.set(xAdjust);
  denominator.mulAssign(zAdjust);
  denominator.mulAssign(feeBase);
  _yDecrease.set(
    mulDiv(_yDecrease, new Uint256(cp.y).shiftLeft(16), denominator)
  );
  const yDecrease = new Uint112(_yDecrease);

  return { yDecrease, zDecrease };
}

export function givenPercent(
  fee: Uint16,
  cp: CP,
  assetIn: Uint112,
  percent: Uint40
): LendResult {
  const feeBase = new Uint256(fee).add(0x10000);

  const xAdjust = new Uint256(cp.x);
  xAdjust.addAssign(assetIn);

  const minimum = new Uint256(assetIn);
  minimum.mulAssign(cp.y);
  minimum.shiftLeftAssign(12);
  const maximum = new Uint256(minimum);
  maximum.shiftLeftAssign(4);
  const denominator = new Uint256(xAdjust);
  denominator.mulAssign(feeBase);
  minimum.divAssign(denominator);
  maximum.divAssign(denominator);

  const _yDecrease = new Uint256(maximum);
  _yDecrease.subAssign(minimum);
  _yDecrease.mulAssign(percent);
  _yDecrease.shiftRightAssign(32);
  _yDecrease.addAssign(minimum);
  const yDecrease = new Uint112(_yDecrease);

  const yAdjust = new Uint256(cp.y);
  yAdjust.shiftLeftAssign(16);
  yAdjust.subAssign(_yDecrease.mul(feeBase));

  const _zDecrease = new Uint256(xAdjust);
  _zDecrease.mulAssign(yAdjust);
  const subtrahend = new Uint256(cp.x);
  subtrahend.mulAssign(cp.y);
  subtrahend.shiftLeftAssign(16);
  _zDecrease.subAssign(subtrahend);
  denominator.set(xAdjust);
  denominator.mulAssign(yAdjust);
  denominator.mulAssign(feeBase);
  _zDecrease.set(
    mulDiv(_zDecrease, new Uint256(cp.z).shiftLeft(16), denominator)
  );
  const zDecrease = new Uint112(_zDecrease);

  return { yDecrease, zDecrease };
}

export function lend(
  fee: Uint16,
  state: CP,
  maturity: Uint256,
  xIncrease: Uint112,
  yDecrease: Uint112,
  zDecrease: Uint112,
  now: Uint256
): Claims {
  invariant(now.toBigInt() < maturity.toBigInt(), 'Expired');

  check(state, xIncrease, yDecrease, zDecrease, fee);

  const bond = getBond(maturity, xIncrease, yDecrease, now);
  const insurance = getInsurance(maturity, state, xIncrease, zDecrease, now);

  return { bond, insurance };
}

function check(
  state: CP,
  xIncrease: Uint112,
  yDecrease: Uint112,
  zDecrease: Uint112,
  fee: Uint16
) {
  const feeBase = new Uint128(fee).add(0x10000);
  const xReserve = state.x.add(xIncrease);
  const yAdjusted = adjust(state.y, yDecrease, feeBase);
  const zAdjusted = adjust(state.z, zDecrease, feeBase);
  checkConstantProduct(state, xReserve, yAdjusted, zAdjusted);

  const minimum = new Uint256(xIncrease);
  minimum.mulAssign(state.y);
  minimum.shiftLeftAssign(12);
  const denominator = new Uint256(xReserve);
  denominator.mulAssign(feeBase);
  minimum.divAssign(denominator);
  invariant(yDecrease.toBigInt() >= minimum.toBigInt(), 'Minimum');
}

function adjust(
  reserve: Uint112,
  decrease: Uint112,
  feeBase: Uint128
): Uint128 {
  const adjusted = new Uint128(reserve);
  adjusted.shiftLeftAssign(16);
  adjusted.subAssign(feeBase.mul(decrease));
  return adjusted;
}

function getBond(
  maturity: Uint256,
  xIncrease: Uint112,
  yDecrease: Uint112,
  now: Uint256
): Uint128 {
  const _bondOut = new Uint256(maturity);
  _bondOut.subAssign(now);
  _bondOut.mulAssign(yDecrease);
  _bondOut.shiftRightAssign(32);
  _bondOut.addAssign(xIncrease);
  const bondOut = new Uint128(_bondOut);

  return bondOut;
}

function getInsurance(
  maturity: Uint256,
  state: CP,
  xIncrease: Uint112,
  zDecrease: Uint112,
  now: Uint256
): Uint128 {
  const _insuranceOut = new Uint256(maturity);
  _insuranceOut.subAssign(now);
  _insuranceOut.mulAssign(state.y);
  _insuranceOut.mulAssign(zDecrease);
  const addend = new Uint256(state.z);
  addend.mulAssign(xIncrease);
  addend.shiftRightAssign(32);
  _insuranceOut.addAssign(addend);
  const denominator = new Uint256(state.x);
  denominator.addAssign(xIncrease);
  denominator.shiftLeftAssign(32);
  _insuranceOut.divAssign(denominator);
  const insuranceOut = new Uint128(_insuranceOut);

  return insuranceOut;
}

export interface LendResult {
  yDecrease: Uint112;
  zDecrease: Uint112;
}

export default {
  givenBond,
  givenInsurance,
  givenPercent,
  lend,
  check,
  adjust,
  getBond,
  getInsurance,
};
