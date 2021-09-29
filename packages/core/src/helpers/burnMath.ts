import { Claims, Tokens } from '../entities';
import { Uint256, Uint128 } from '../uint';
import { mulDiv } from './fullMath';

export function burn(
  reserves: Tokens,
  totalClaims: Claims,
  totalLiquidity: Uint256,
  liquidityIn: Uint256
): Tokens {
  const asset = getAsset(reserves, totalClaims, totalLiquidity, liquidityIn);
  const collateral = getCollateral(
    reserves,
    totalClaims,
    totalLiquidity,
    liquidityIn
  );

  return { asset, collateral };
}

function getAsset(
  reserves: Tokens,
  totalClaims: Claims,
  totalLiquidity: Uint256,
  liquidityIn: Uint256
): Uint128 {
  const assetOut = new Uint128(0);
  const assetReserve = new Uint256(reserves.asset);
  if (assetReserve.toBigInt() <= totalClaims.bond.toBigInt()) return assetOut;
  const _assetOut = new Uint256(assetReserve);
  _assetOut.subAssign(totalClaims.bond);
  _assetOut.set(mulDiv(_assetOut, liquidityIn, totalLiquidity));
  assetOut.set(_assetOut);
  return assetOut;
}

function getCollateral(
  reserves: Tokens,
  totalClaims: Claims,
  totalLiquidity: Uint256,
  liquidityIn: Uint256
): Uint128 {
  const collateralOut = new Uint128(0);
  const assetReserve = new Uint256(reserves.asset);
  const _collateralOut = new Uint256(reserves.collateral);
  if (assetReserve.toBigInt() >= totalClaims.bond.toBigInt()) {
    _collateralOut.set(mulDiv(_collateralOut, liquidityIn, totalLiquidity));
    collateralOut.set(_collateralOut);
    return collateralOut;
  }
  const _reduce = new Uint256(totalClaims.bond);
  _reduce.subAssign(assetReserve);
  _reduce.mulAssign(totalClaims.insurance);
  if (
    reserves.collateral.toBigInt() * totalClaims.bond.toBigInt() <=
    _reduce.toBigInt()
  )
    return collateralOut;
  _collateralOut.mulAssign(totalClaims.bond);
  _collateralOut.subAssign(_reduce);
  _collateralOut.set(
    mulDiv(_collateralOut, liquidityIn, totalLiquidity.mul(totalClaims.bond))
  );
  collateralOut.set(_collateralOut);
  return collateralOut;
}

export default {
  burn,
  getAsset,
  getCollateral,
};
