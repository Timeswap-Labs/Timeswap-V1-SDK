import { State, Uint112, Uint128, Uint256 } from '..';
import { getConstantProduct } from './constantProduct';
import { mulDiv } from './fullMath';
import { divUp } from './math';

export function givenBond(
  fee: Uint16,
  state: State,
  maturity: Uint256,
  assetIn: Uint112,
  bondOut: Uint128,
  now: bigint
): LendResult {
  const feeBase = 0x10000n + fee;

  const _interestDecrease = bondOut;
  _interestDecrease.subAssign(assetIn);
  _interestDecrease.shiftLeftAssign(32);
  _interestDecrease.set(divUp(_interestDecrease, maturity.sub(now)));
  const interestDecrease = new Uint112(_interestDecrease);

  let interestAdjust = state.interest;
  interestAdjust <<= 16n;
  interestAdjust -= _interestDecrease * feeBase;

  const cdpAdjust = getConstantProduct(
    state,
    state.asset + assetIn,
    interestAdjust
  );

  let _cdpDecrease = state.cdp;
  _cdpDecrease <<= 16n;
  _cdpDecrease -= cdpAdjust;
  _cdpDecrease /= feeBase;
  const cdpDecrease = _cdpDecrease;

  return { interestDecrease, cdpDecrease };
}

export function givenInsurance(
  fee: bigint,
  state: State,
  maturity: bigint,
  assetIn: bigint,
  insuranceOut: bigint,
  now: bigint
): LendResult {
  const feeBase = 0x10000n + fee;

  let subtrahend = maturity;
  subtrahend -= now;
  subtrahend *= state.interest;
  subtrahend += state.asset << 32n;
  let denominator = state.asset;
  denominator += assetIn;
  denominator *= state.asset << 32n;
  subtrahend = mulDiv(subtrahend, assetIn * state.cdp, denominator);

  let _cdpDecrease = insuranceOut;
  _cdpDecrease -= subtrahend;
  const cdpDecrease = _cdpDecrease;

  let cdpAdjust = state.cdp;
  cdpAdjust <<= 16n;
  cdpAdjust -= cdpDecrease * feeBase;

  const interestAdjust = getConstantProduct(
    state,
    state.asset + assetIn,
    cdpAdjust
  );

  let _interestDecrease = state.interest;
  _interestDecrease <<= 16n;
  _interestDecrease -= interestAdjust;
  _interestDecrease /= feeBase;
  const interestDecrease = _interestDecrease;

  return { interestDecrease, cdpDecrease };
}

export function givenPercent(
  fee: bigint,
  state: State,
  assetIn: bigint,
  percent: bigint
): LendResult {
  const feeBase = 0x10000n + fee;

  let minimum = assetIn;
  minimum *= state.interest;
  minimum /= (state.asset + assetIn) << 4n;

  let interestAdjust = state.asset;
  interestAdjust *= state.interest;
  interestAdjust <<= 16n;
  interestAdjust /= state.asset + assetIn;

  let maximum = state.interest;
  maximum <<= 16n;
  maximum -= interestAdjust;
  maximum /= feeBase;

  let _interestDecrease = maximum;
  _interestDecrease -= minimum;
  _interestDecrease *= percent;
  _interestDecrease += minimum << 32n;
  _interestDecrease >>= 32n;
  const interestDecrease = _interestDecrease;

  interestAdjust = state.interest;
  interestAdjust <<= 16n;
  interestAdjust -= _interestDecrease * feeBase;

  const cdpAdjust = getConstantProduct(
    state,
    state.asset + assetIn,
    interestAdjust
  );

  let _cdpDecrease = state.cdp;
  _cdpDecrease <<= 16n;
  _cdpDecrease -= cdpAdjust;
  _cdpDecrease /= feeBase;
  const cdpDecrease = _cdpDecrease;

  return { interestDecrease, cdpDecrease };
}

export interface LendResult {
  interestDecrease: Uint112;
  cdpDecrease: Uint112;
}
