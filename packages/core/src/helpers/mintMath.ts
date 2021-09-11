import invariant from 'tiny-invariant';
import { CP, Due } from '../entities';
import { Uint16, Uint256, Uint112 } from '../uint';
import { mulDiv, mulDivUp } from './fullMath';
import { shiftUp } from './math';

export function givenNew(
  maturity: Uint256,
  assetIn: Uint112,
  debtIn: Uint112,
  collateralIn: Uint112,
  now: Uint256
): MintResult {
  const _yIncrease = new Uint256(debtIn);
  _yIncrease.subAssign(assetIn);
  _yIncrease.shiftLeftAssign(32);
  _yIncrease.divAssign(maturity.sub(now));
  const yIncrease = new Uint112(_yIncrease);

  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.mulAssign(yIncrease);
  denominator.addAssign(new Uint256(assetIn).shiftLeft(33));
  const _zIncrease = new Uint256(collateralIn);
  _zIncrease.mulAssign(assetIn);
  _zIncrease.shiftLeftAssign(32);
  _zIncrease.divAssign(denominator);
  const zIncrease = new Uint112(_zIncrease);

  return { yIncrease, zIncrease };
}

export function givenAdd(cp: CP, assetIn: Uint112): MintResult {
  const _yIncrease = new Uint256(cp.y);
  _yIncrease.mulAssign(assetIn);
  _yIncrease.divAssign(cp.x);
  const yIncrease = new Uint112(_yIncrease);

  const _zIncrease = new Uint256(cp.z);
  _zIncrease.mulAssign(assetIn);
  _zIncrease.divAssign(cp.x);
  const zIncrease = new Uint112(_zIncrease);

  return { yIncrease, zIncrease };
}

export function mint(
  protocolFee: Uint16,
  state: CP,
  totalLiquidity: Uint256,
  maturity: Uint256,
  xIncrease: Uint112,
  yIncrease: Uint112,
  zIncrease: Uint112,
  now: Uint256
): {
  liquidityOut: Uint256;
  dueOut: Due;
} {
  invariant(now < maturity, 'Expired');

  let liquidityOut: Uint256;

  if (totalLiquidity.value === 0n) {
    const liquidityTotal = getLiquidityTotal1(xIncrease);
    liquidityOut = getLiquidity(maturity, liquidityTotal, protocolFee, now);
  } else {
    const liquidityTotal = getLiquidityTotal2(
      state,
      totalLiquidity,
      xIncrease,
      yIncrease,
      zIncrease
    );
    liquidityOut = getLiquidity(maturity, liquidityTotal, protocolFee, now);
  }

  const debt = getDebt(maturity, xIncrease, yIncrease, now);
  const collateral = getCollateral(
    maturity,
    xIncrease,
    yIncrease,
    zIncrease,
    now
  );
  const dueOut = { debt, collateral };

  return { liquidityOut, dueOut };
}

function getLiquidityTotal1(xIncrease: Uint112): Uint256 {
  const liquidityTotal = new Uint256(xIncrease);
  liquidityTotal.shiftLeftAssign(56);

  return liquidityTotal;
}

function getLiquidityTotal2(
  state: CP,
  totalLiquidity: Uint256,
  xIncrease: Uint112,
  yIncrease: Uint112,
  zIncrease: Uint112
): Uint256 {
  return min(
    mulDiv(totalLiquidity, new Uint256(xIncrease), new Uint256(state.x)),
    mulDiv(totalLiquidity, new Uint256(yIncrease), new Uint256(state.y)),
    mulDiv(totalLiquidity, new Uint256(zIncrease), new Uint256(state.z))
  );
}

function getLiquidity(
  maturity: Uint256,
  liquidityTotal: Uint256,
  protocolFee: Uint16,
  now: Uint256
): Uint256 {
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.mulAssign(protocolFee);
  denominator.addAssign(0x10000000000);
  const liquidityOut = mulDiv(
    liquidityTotal,
    new Uint256(0x10000000000),
    denominator
  );

  return liquidityOut;
}

function min(x: Uint256, y: Uint256, z: Uint256): Uint256 {
  if (x <= y && x <= z) {
    return x;
  } else if (y <= x && y <= z) {
    return y;
  } else {
    return z;
  }
}

function getDebt(
  maturity: Uint256,
  xIncrease: Uint112,
  yIncrease: Uint112,
  now: Uint256
): Uint112 {
  const _debtIn = new Uint256(maturity);
  _debtIn.subAssign(now);
  _debtIn.mulAssign(yIncrease);
  _debtIn.set(shiftUp(_debtIn, new Uint256(32)));
  _debtIn.addAssign(xIncrease);
  const debtIn = new Uint112(_debtIn);

  return debtIn;
}

function getCollateral(
  maturity: Uint256,
  xIncrease: Uint112,
  yIncrease: Uint112,
  zIncrease: Uint112,
  now: Uint256
): Uint112 {
  const _collateralIn = new Uint256(maturity);
  _collateralIn.subAssign(now);
  _collateralIn.mulAssign(yIncrease);
  _collateralIn.addAssign(new Uint256(xIncrease).shiftLeft(33));
  _collateralIn.set(
    mulDivUp(
      _collateralIn,
      new Uint256(zIncrease),
      new Uint256(xIncrease).shiftLeft(32)
    )
  );
  const collateralIn = new Uint112(_collateralIn);

  return collateralIn;
}

export interface MintResult {
  yIncrease: Uint112;
  zIncrease: Uint112;
}

export default {
  givenNew,
  givenAdd,
  mint,
  getLiquidityTotal1,
  getLiquidityTotal2,
  getLiquidity,
  min,
  getDebt,
  getCollateral,
};
