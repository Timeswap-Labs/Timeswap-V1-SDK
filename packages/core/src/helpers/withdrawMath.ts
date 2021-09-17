import { Claims, Tokens } from '../entities';
import { Uint256, Uint128 } from '../uint';
import { mulDiv } from './fullMath';

export function getAsset(
  claims: Claims,
  reserves: Tokens,
  bondIn: Uint128
): Uint128 {
  const assetOut = new Uint128(0);
  const assetReserve = new Uint256(reserves.asset);
  if (assetReserve.value >= claims.bond.value) {
    const assetOut = bondIn;
    return assetOut;
  }
  const _assetOut = new Uint256(bondIn);
  _assetOut.mulAssign(assetReserve);
  _assetOut.divAssign(claims.bond);
  assetOut.set(_assetOut);
  return assetOut;
}

export function getCollateral(
  reserves: Tokens,
  claims: Claims,
  insuranceIn: Uint128
): Uint128 {
  const collateralOut = new Uint128(0);
  const assetReserve = new Uint256(reserves.asset);
  if (assetReserve.value >= claims.bond.value) return collateralOut;
  const _collateralOut = new Uint256(claims.bond);
  _collateralOut.subAssign(assetReserve);
  _collateralOut.mulAssign(claims.insurance);
  if (reserves.collateral.mul(claims.bond).value >= _collateralOut.value) {
    const collateralOut = insuranceIn;
    return collateralOut;
  }
  _collateralOut.set(
    mulDiv(
      _collateralOut,
      new Uint256(insuranceIn),
      new Uint256(claims.bond.mul(claims.insurance))
    )
  );
  collateralOut.set(_collateralOut);

  return collateralOut;
}
