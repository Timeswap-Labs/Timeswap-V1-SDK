import invariant from 'tiny-invariant';
import { Claims, State, Uint112, Uint128, Uint16, Uint256, Uint40 } from '..';
import { checkConstantProduct, getConstantProduct } from './constantProduct';
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
    new Uint256(state.asset.add(assetIn)),
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
  subtrahend.set(
    mulDiv(subtrahend, new Uint256(assetIn.mul(state.cdp)), denominator)
  );

  const _cdpDecrease = new Uint256(insuranceOut);
  _cdpDecrease.subAssign(subtrahend);
  const cdpDecrease = new Uint112(_cdpDecrease);

  const cdpAdjust = new Uint256(state.cdp);
  cdpAdjust.shiftLeftAssign(16);
  cdpAdjust.subAssign(cdpDecrease.mul(feeBase));

  const interestAdjust = getConstantProduct(
    state,
    new Uint256(state.asset.add(assetIn)),
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
    new Uint256(state.asset.add(assetIn)),
    interestAdjust
  );

  const _cdpDecrease = new Uint256(state.cdp);
  _cdpDecrease.shiftLeftAssign(16);
  _cdpDecrease.subAssign(cdpAdjust);
  _cdpDecrease.divAssign(feeBase);
  const cdpDecrease = new Uint112(_cdpDecrease);

  return { interestDecrease, cdpDecrease };
}

export function lend(
  fee: Uint16,
  state: State,
  maturity: Uint256,
  assetIn: Uint112,
  interestDecrease: Uint112,
  cdpDecrease: Uint112,
  now: Uint256
): Claims {
  invariant(now < maturity, 'Expired');

  check(state, assetIn, interestDecrease, cdpDecrease, fee);

  const bond = getBond(maturity, assetIn, interestDecrease, now);
  const insurance = getInsurance(maturity, state, assetIn, cdpDecrease, now);

  return { bond, insurance };
}

function check(
  state: State,
  assetIn: Uint112,
  interestDecrease: Uint112,
  cdpDecrease: Uint112,
  fee: Uint16
) {
  const feeBase = new Uint128(fee.add(0x10000));
  const assetReserve = state.asset.add(assetIn);
  const interestAdjusted = adjust(interestDecrease, state.interest, feeBase);
  const cdpAdjusted = adjust(cdpDecrease, state.cdp, feeBase);
  checkConstantProduct(state, assetReserve, interestAdjusted, cdpAdjusted);

  const minimum = new Uint256(assetIn);
  minimum.mulAssign(state.interest);
  minimum.divAssign(new Uint256(assetReserve).shiftLeft(4));
  invariant(interestDecrease.value >= minimum.value, 'Invalid');
}

function adjust(
  decrease: Uint112,
  reserve: Uint112,
  feeBase: Uint128
): Uint128 {
  const adjusted = new Uint128(reserve);
  adjusted.shiftLeftAssign(16);
  adjusted.subAssign(feeBase.mul(decrease));
  return adjusted;
}

function getBond(
  maturity: Uint256,
  assetIn: Uint112,
  interestDecrease: Uint112,
  now: Uint256
): Uint128 {
  const _bondOut = new Uint256(maturity);
  _bondOut.subAssign(now);
  _bondOut.mulAssign(interestDecrease);
  _bondOut.shiftRightAssign(32);
  _bondOut.addAssign(assetIn);
  const bondOut = new Uint128(_bondOut);

  return bondOut;
}

function getInsurance(
  maturity: Uint256,
  state: State,
  assetIn: Uint112,
  cdpDecrease: Uint112,
  now: Uint256
): Uint128 {
  const _insuranceOut = new Uint256(maturity);
  _insuranceOut.subAssign(now);
  _insuranceOut.mulAssign(state.interest);
  _insuranceOut.addAssign(new Uint256(state.asset).shiftLeft(32));
  const denominator = new Uint256(state.asset);
  denominator.addAssign(assetIn);
  denominator.mulAssign(new Uint256(state.asset).shiftLeft(32));
  _insuranceOut.set(
    mulDiv(_insuranceOut, new Uint256(assetIn).mul(state.cdp), denominator)
  );
  _insuranceOut.addAssign(cdpDecrease);
  const insuranceOut = new Uint128(_insuranceOut);

  return insuranceOut;
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
