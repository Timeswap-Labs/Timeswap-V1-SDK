import invariant from 'tiny-invariant';
import { CP, Due } from '../entities';
import { Uint256, Uint112 } from '../uint';
import { divUp } from './math';
import timeswapMath from './timeswapMath';

export function givenNew(
  maturity: Uint256,
  assetIn: Uint112,
  debtIn: Uint112,
  collateralIn: Uint112,
  now: Uint256
): LiquidityResult {
  const xIncrease = new Uint112(assetIn);

  const duration = new Uint256(maturity);
  duration.subAssign(now);

  const _yIncrease = new Uint256(debtIn);
  _yIncrease.subAssign(assetIn);
  _yIncrease.shlAssign(32);
  _yIncrease.divAssign(duration);
  const yIncrease = new Uint112(_yIncrease);

  const _zIncrease = new Uint256(collateralIn);
  _zIncrease.shlAssign(25);
  const denominator = new Uint256(duration);
  denominator.addAssign(0x2000000n);
  _zIncrease.divAssign(denominator);
  const zIncrease = new Uint112(_zIncrease);

  return { xIncrease, yIncrease, zIncrease };
}

export function givenAsset(
  cp: CP,
  assetIn: Uint112,
  feeStored: Uint256
): LiquidityResult {
  const _xIncrease = new Uint256(assetIn);
  _xIncrease.mulAssign(cp.x);
  const denominator = new Uint256(cp.x);
  denominator.addAssign(feeStored);
  _xIncrease.divAssign(denominator);
  const xIncrease = new Uint112(_xIncrease);

  const _yIncrease = new Uint256(cp.y);
  _yIncrease.mulAssign(xIncrease);
  _yIncrease.divAssign(cp.x);
  const yIncrease = new Uint112(_yIncrease);

  const _zIncrease = new Uint256(cp.z);
  _zIncrease.mulAssign(xIncrease);
  _zIncrease.divAssign(cp.x);
  const zIncrease = new Uint112(_zIncrease);

  return { xIncrease, yIncrease, zIncrease };
}

export function givenDebt(
  cp: CP,
  maturity: Uint256,
  debtIn: Uint112,
  now: Uint256
): LiquidityResult {
  const _yIncrease = new Uint256(debtIn);
  _yIncrease.mulAssign(cp.y);
  _yIncrease.shlAssign(32);
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.mulAssign(cp.y);
  const addend = new Uint256(cp.x);
  addend.shlAssign(32);
  denominator.addAssign(addend);
  _yIncrease.divAssign(denominator);
  const yIncrease = new Uint112(_yIncrease);

  const _xIncrease = new Uint256(cp.x);
  _xIncrease.mulAssign(_yIncrease);
  _xIncrease.set(divUp(_xIncrease, new Uint256(cp.y)));
  const xIncrease = new Uint112(_xIncrease);

  const _zIncrease = new Uint256(cp.z);
  _zIncrease.mulAssign(_yIncrease);
  _zIncrease.divAssign(cp.y);
  const zIncrease = new Uint112(_zIncrease);

  return { xIncrease, yIncrease, zIncrease };
}

export function givenCollateral(
  cp: CP,
  maturity: Uint256,
  collateralIn: Uint112,
  now: Uint256
): LiquidityResult {
  const _zIncrease = new Uint256(collateralIn);
  _zIncrease.shlAssign(25);
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.addAssign(0x2000000);
  _zIncrease.divAssign(denominator);
  const zIncrease = new Uint112(_zIncrease);

  const _xIncrease = new Uint256(cp.x);
  _xIncrease.mulAssign(_zIncrease);
  _xIncrease.set(divUp(_xIncrease, new Uint256(cp.z)));
  const xIncrease = new Uint112(_xIncrease);

  const _yIncrease = new Uint256(cp.y);
  _yIncrease.mulAssign(_zIncrease);
  _yIncrease.divAssign(cp.z);
  const yIncrease = new Uint112(_yIncrease);

  return { xIncrease, yIncrease, zIncrease };
}

export function mint(
  feeStored: Uint256,
  state: CP,
  totalLiquidity: Uint256,
  maturity: Uint256,
  xIncrease: Uint112,
  yIncrease: Uint112,
  zIncrease: Uint112,
  now: Uint256
): {
  assetIn: Uint256;
  liquidityOut: Uint256;
  dueOut: Due;
} {
  invariant(now.lt(maturity), 'E202');
  invariant(maturity.sub(now).lt(0x100000000), 'E208');
  invariant(xIncrease.ne(0), 'E205');
  invariant(yIncrease.ne(0), 'E205');
  invariant(zIncrease.ne(0), 'E205');

  const { liquidityOut, dueOut, feeStoredIncrease } = timeswapMath.mint(
    maturity,
    state,
    totalLiquidity,
    feeStored,
    xIncrease,
    yIncrease,
    zIncrease,
    now
  );

  const assetIn = new Uint256(xIncrease);
  assetIn.addAssign(feeStoredIncrease);

  return { assetIn, liquidityOut, dueOut };
}

interface LiquidityResult {
  xIncrease: Uint112;
  yIncrease: Uint112;
  zIncrease: Uint112;
}

export default {
  givenNew,
  givenAsset,
  givenDebt,
  givenCollateral,
  mint,
};
