import invariant from 'tiny-invariant';
import { CP, Due } from '../entities';
import { Uint16, Uint256, Uint112 } from '../uint';
import { mulDiv } from './fullMath';
import { shiftRightUp } from './math';

export function givenNew(
  maturity: Uint256,
  assetIn: Uint112,
  debtIn: Uint112,
  collateralIn: Uint112,
  now: Uint256
): {
  yIncrease: Uint112;
  zIncrease: Uint112;
} {
  const _yIncrease = new Uint256(debtIn);
  _yIncrease.subAssign(assetIn);
  _yIncrease.shiftLeftAssign(32);
  _yIncrease.divAssign(maturity.sub(now));
  const yIncrease = new Uint112(_yIncrease);

  const _zIncrease = new Uint256(collateralIn);
  _zIncrease.shiftLeftAssign(25);
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.addAssign(0x2000000n);
  _zIncrease.divAssign(denominator);
  const zIncrease = new Uint112(_zIncrease);

  return { yIncrease, zIncrease };
}

export function givenAsset(
  cp: CP,
  assetIn: Uint112
): {
  yIncrease: Uint112;
  zIncrease: Uint112;
} {
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

export function givenDebt(
  cp: CP,
  maturity: Uint256,
  debtIn: Uint112,
  now: Uint256
): {
  xIncrease: Uint112;
  yIncrease: Uint112;
  zIncrease: Uint112;
} {
  const _yIncrease = new Uint256(debtIn);
  _yIncrease.mulAssign(cp.y);
  _yIncrease.shiftLeftAssign(32);
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.mulAssign(cp.y);
  const addend = new Uint256(cp.x);
  addend.shiftLeftAssign(32);
  denominator.addAssign(addend);
  _yIncrease.divAssign(denominator);
  const yIncrease = new Uint112(_yIncrease);

  const _xIncrease = new Uint256(cp.x);
  _xIncrease.mulAssign(_yIncrease);
  _xIncrease.divAssign(cp.y);
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
): {
  xIncrease: Uint112;
  yIncrease: Uint112;
  zIncrease: Uint112;
} {
  const _zIncrease = new Uint256(collateralIn);
  _zIncrease.shiftLeftAssign(25);
  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.addAssign(0x2000000);
  _zIncrease.divAssign(denominator);
  const zIncrease = new Uint112(_zIncrease);

  const _xIncrease = new Uint256(cp.x);
  _xIncrease.mulAssign(_zIncrease);
  _xIncrease.divAssign(cp.z);
  const xIncrease = new Uint112(_xIncrease);

  const _yIncrease = new Uint256(cp.y);
  _yIncrease.mulAssign(_zIncrease);
  _yIncrease.divAssign(cp.z);
  const yIncrease = new Uint112(_yIncrease);

  return { xIncrease, yIncrease, zIncrease };
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
  invariant(now.toBigInt() < maturity.toBigInt(), 'Expired');
  invariant(maturity.sub(now).lt(0x100000000), 'Duration overflow');

  let liquidityOut: Uint256;

  if (totalLiquidity.eq(0)) {
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
  const collateral = getCollateral(maturity, zIncrease, now);
  const dueOut = { debt, collateral };

  return { liquidityOut, dueOut };
}

function getLiquidityTotal1(xIncrease: Uint112): Uint256 {
  const liquidityTotal = new Uint256(xIncrease);
  liquidityTotal.shiftLeftAssign(16);

  return liquidityTotal;
}

function getLiquidityTotal2(
  state: CP,
  totalLiquidity: Uint256,
  xIncrease: Uint112,
  yIncrease: Uint112,
  zIncrease: Uint112
): Uint256 {
  const liquidityTotal = mulDiv(
    totalLiquidity,
    new Uint256(xIncrease),
    new Uint256(state.x)
  );

  invariant(
    mulDiv(totalLiquidity, new Uint256(yIncrease), new Uint256(state.y)).lte(
      liquidityTotal
    ),
    'E214'
  );
  invariant(
    mulDiv(totalLiquidity, new Uint256(zIncrease), new Uint256(state.z)).lte(
      liquidityTotal
    ),
    'E215'
  );

  return liquidityTotal;
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

function getDebt(
  maturity: Uint256,
  xIncrease: Uint112,
  yIncrease: Uint112,
  now: Uint256
): Uint112 {
  const _debtIn = new Uint256(maturity);
  _debtIn.subAssign(now);
  _debtIn.mulAssign(yIncrease);
  _debtIn.set(shiftRightUp(_debtIn, new Uint256(32)));
  _debtIn.addAssign(xIncrease);
  const debtIn = new Uint112(_debtIn);

  return debtIn;
}

function getCollateral(
  maturity: Uint256,
  zIncrease: Uint112,
  now: Uint256
): Uint112 {
  const _collateralIn = new Uint256(maturity);
  _collateralIn.subAssign(now);
  _collateralIn.mulAssign(zIncrease);
  _collateralIn.set(shiftRightUp(_collateralIn, new Uint256(25)));
  _collateralIn.addAssign(zIncrease);
  const collateralIn = new Uint112(_collateralIn);

  return collateralIn;
}

export default {
  givenNew,
  givenAsset,
  givenDebt,
  givenCollateral,
  mint,
  getLiquidityTotal1,
  getLiquidityTotal2,
  getLiquidity,
  getDebt,
  getCollateral,
};
