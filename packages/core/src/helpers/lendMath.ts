import invariant from 'tiny-invariant';
import { Claims, CP } from '../entities';
import { Uint16, Uint256, Uint112, Uint40, Uint128 } from '../uint';
import { mulDivUp } from './fullMath';
import { divUp } from './math';
import { sqrtUp } from './squareRoot';
import timeswapMath from './timeswapMath';

const BASE = new Uint256(0x10000000000);

export function givenBond(
  fee: Uint16,
  protocolFee: Uint16,
  cp: CP,
  maturity: Uint256,
  assetIn: Uint112,
  bondOut: Uint128,
  now: Uint256
): LendResult {
  const xIncrease = getX(maturity, assetIn, fee, protocolFee, now);

  const xReserve = new Uint256(cp.x);
  xReserve.addAssign(xIncrease);

  const _yDecrease = new Uint256(bondOut);
  _yDecrease.subAssign(xIncrease);
  _yDecrease.shlAssign(32);
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  _yDecrease.set(divUp(_yDecrease, denominator));
  const yDecrease = new Uint112(_yDecrease);

  const yReserve = new Uint256(cp.y);
  yReserve.subAssign(_yDecrease);

  const zReserve = new Uint256(cp.x);
  zReserve.mulAssign(cp.y);
  denominator.set(xReserve);
  denominator.mulAssign(yReserve);
  zReserve.set(mulDivUp(zReserve, new Uint256(cp.z), denominator));

  const _zDecrease = new Uint256(cp.z);
  _zDecrease.subAssign(zReserve);
  const zDecrease = new Uint112(_zDecrease);

  return { xIncrease, yDecrease, zDecrease };
}

export function givenInsurance(
  fee: Uint16,
  protocolFee: Uint16,
  cp: CP,
  maturity: Uint256,
  assetIn: Uint112,
  insuranceOut: Uint128,
  now: Uint256
): LendResult {
  const xIncrease = getX(maturity, assetIn, fee, protocolFee, now);

  const xReserve = new Uint256(cp.x);
  xReserve.addAssign(xIncrease);

  const _zDecrease = new Uint256(insuranceOut);
  _zDecrease.mulAssign(xReserve);
  const subtrahend = new Uint256(cp.z);
  subtrahend.mulAssign(xIncrease);
  _zDecrease.subAssign(subtrahend);
  _zDecrease.shlAssign(25);
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.mulAssign(xReserve);
  _zDecrease.set(divUp(_zDecrease, denominator));
  const zDecrease = new Uint112(_zDecrease);

  const zReserve = new Uint256(cp.z);
  zReserve.subAssign(_zDecrease);

  const yReserve = new Uint256(cp.x);
  yReserve.mulAssign(cp.z);
  denominator.set(xReserve);
  denominator.mulAssign(zReserve);
  yReserve.set(mulDivUp(yReserve, new Uint256(cp.y), denominator));

  const _yDecrease = new Uint256(cp.y);
  _yDecrease.subAssign(yReserve);
  const yDecrease = new Uint112(_yDecrease);

  return { xIncrease, yDecrease, zDecrease };
}

export function givenPercent(
  fee: Uint16,
  protocolFee: Uint16,
  cp: CP,
  maturity: Uint256,
  assetIn: Uint112,
  percent: Uint40,
  now: Uint256
): LendResult {
  const yDecrease = new Uint112(0);
  const zDecrease = new Uint112(0);

  const xIncrease = getX(maturity, assetIn, fee, protocolFee, now);

  const xReserve = new Uint256(cp.x);
  xReserve.addAssign(xIncrease);

  if (percent.lte(0x80000000)) {
    const yMid = new Uint256(cp.y);
    const subtrahend = new Uint256(cp.y);
    subtrahend.mulAssign(cp.y);
    subtrahend.set(mulDivUp(subtrahend, new Uint256(cp.x), xReserve));
    subtrahend.set(sqrtUp(subtrahend));
    yMid.subAssign(subtrahend);

    const _yDecrease = new Uint256(yMid);
    _yDecrease.mulAssign(percent);
    _yDecrease.shrAssign(31);
    yDecrease.set(_yDecrease);

    const yReserve = new Uint256(cp.y);
    yReserve.subAssign(_yDecrease);

    const zReserve = new Uint256(cp.x);
    zReserve.mulAssign(cp.y);
    const denominator = new Uint256(xReserve);
    denominator.mulAssign(yReserve);
    zReserve.set(mulDivUp(zReserve, new Uint256(cp.z), denominator));

    const _zDecrease = new Uint256(cp.z);
    _zDecrease.subAssign(zReserve);
    zDecrease.set(_zDecrease);
  } else {
    percent.set(new Uint40(0x100000000).sub(percent));

    const zMid = new Uint256(cp.z);
    const subtrahend = new Uint256(cp.z);
    subtrahend.mulAssign(cp.z);
    subtrahend.set(mulDivUp(subtrahend, new Uint256(cp.z), xReserve));
    subtrahend.set(sqrtUp(subtrahend));
    zMid.subAssign(subtrahend);

    const _zDecrease = new Uint256(zMid);
    _zDecrease.mulAssign(percent);
    _zDecrease.shrAssign(31);
    zDecrease.set(_zDecrease);

    const zReserve = new Uint256(cp.z);
    zReserve.subAssign(_zDecrease);

    const yReserve = new Uint256(cp.x);
    yReserve.mulAssign(cp.z);
    const denominator = new Uint256(xReserve);
    denominator.mulAssign(zReserve);
    yReserve.set(mulDivUp(yReserve, new Uint256(cp.y), denominator));

    const _yDecrease = new Uint256(cp.y);
    _yDecrease.subAssign(yReserve);
    yDecrease.set(_yDecrease);
  }

  return { xIncrease, yDecrease, zDecrease };
}

export function lend(
  fee: Uint16,
  protocolFee: Uint16,
  state: CP,
  maturity: Uint256,
  xIncrease: Uint112,
  yDecrease: Uint112,
  zDecrease: Uint112,
  now: Uint256
): { assetIn: Uint256; claimsOut: Claims } {
  invariant(now.lt(maturity), 'Expired');
  invariant(xIncrease.ne(0), 'E205');

  const {
    claimsOut,
    feeStoredIncrease,
    protocolFeeStoredIncrease,
  } = timeswapMath.lend(
    maturity,
    state,
    xIncrease,
    yDecrease,
    zDecrease,
    fee,
    protocolFee,
    now
  );

  const assetIn = new Uint256(xIncrease);
  assetIn.addAssign(feeStoredIncrease);
  assetIn.addAssign(protocolFeeStoredIncrease);

  return { assetIn, claimsOut };
}

function getX(
  maturity: Uint256,
  assetIn: Uint112,
  fee: Uint16,
  protocolFee: Uint16,
  now: Uint256
): Uint112 {
  const totalFee = new Uint256(fee);
  totalFee.addAssign(protocolFee);

  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.mulAssign(totalFee);
  denominator.addAssign(BASE);

  const _xIncrease = new Uint256(assetIn);
  _xIncrease.mulAssign(BASE);
  _xIncrease.divAssign(denominator);
  const xIncrease = new Uint112(_xIncrease);

  return xIncrease;
}

export interface LendResult {
  xIncrease: Uint112;
  yDecrease: Uint112;
  zDecrease: Uint112;
}

export default {
  givenBond,
  givenInsurance,
  givenPercent,
  lend,
  getX,
};
