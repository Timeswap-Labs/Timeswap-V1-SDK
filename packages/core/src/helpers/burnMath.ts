import { Claims, Tokens } from '../entities';
import { Uint256, Uint128 } from '../uint';
import { mulDiv } from './fullMath';

export function getAsset(
  claims: Claims,
  reserves: Tokens,
  totalLiquidity: Uint256,
  liquidityIn: Uint256
): Uint128 {
  const assetOut = new Uint128(0);
  const assetReserve = new Uint256(reserves.asset);
  if (assetReserve.value <= claims.bond.value) return assetOut;
  const _assetOut = new Uint256(assetReserve);
  _assetOut.subAssign(claims.bond);
  _assetOut.set(mulDiv(_assetOut, liquidityIn, totalLiquidity));
  assetOut.set(_assetOut);
  return assetOut;
}

export function getCollateral(
  claims: Claims,
  reserves: Tokens,
  totalLiquidity: Uint256,
  liquidityIn: Uint256
): Uint128 {
  const collateralOut = new Uint128(0);
  const assetReserve = new Uint256(reserves.asset);
  const _collateralOut = new Uint256(reserves.collateral);
  if (assetReserve.value >= claims.bond.value) {
    _collateralOut.set(mulDiv(_collateralOut, liquidityIn, totalLiquidity));
    const collateralOut = new Uint128(_collateralOut);
    return collateralOut;
  }
  const _reduce = new Uint256(claims.bond);
  _reduce.subAssign(assetReserve);
  _reduce.mulAssign(claims.insurance);
  if (reserves.collateral.mul(claims.bond).value <= _reduce.value)
    return collateralOut;
  _collateralOut.mulAssign(claims.bond);
  _collateralOut.subAssign(_reduce);
  _collateralOut.set(
    mulDiv(_collateralOut, liquidityIn, totalLiquidity.mul(claims.bond))
  );
  collateralOut.set(_collateralOut);
  return collateralOut;
}
