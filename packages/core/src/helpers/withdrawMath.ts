import { Claims, Tokens } from '../entities';
import { Uint256, Uint128 } from '../uint';
import { mulDiv } from './fullMath';

export function withdraw(
  reserves: Tokens,
  totalClaims: Claims,
  claimsIn: Claims
): Tokens {
  const asset = getAsset(reserves, totalClaims, claimsIn.bond);
  const collateral = getCollateral(reserves, totalClaims, claimsIn.insurance);

  return { asset, collateral };
}

function getAsset(
  reserves: Tokens,
  totalClaims: Claims,
  bondIn: Uint128
): Uint128 {
  const assetOut = new Uint128(0);
  const assetReserve = new Uint256(reserves.asset);
  if (assetReserve.toBigInt() >= totalClaims.bond.toBigInt()) {
    assetOut.set(bondIn);
    return assetOut;
  }
  const _assetOut = new Uint256(bondIn);
  _assetOut.mulAssign(assetReserve);
  _assetOut.divAssign(totalClaims.bond);
  assetOut.set(_assetOut);
  return assetOut;
}

function getCollateral(
  reserves: Tokens,
  totalClaims: Claims,
  insuranceIn: Uint128
): Uint128 {
  const collateralOut = new Uint128(0);
  const assetReserve = new Uint256(reserves.asset);
  if (assetReserve.toBigInt() >= totalClaims.bond.toBigInt())
    return collateralOut;
  const _collateralOut = new Uint256(totalClaims.bond);
  _collateralOut.subAssign(assetReserve);
  _collateralOut.mulAssign(totalClaims.insurance);
  if (
    reserves.collateral.toBigInt() * totalClaims.bond.toBigInt() >=
    _collateralOut.toBigInt()
  ) {
    collateralOut.set(insuranceIn);
    return collateralOut;
  }
  _collateralOut.set(
    mulDiv(
      _collateralOut,
      new Uint256(insuranceIn),
      new Uint256(totalClaims.bond.mul(totalClaims.insurance))
    )
  );
  collateralOut.set(_collateralOut);

  return collateralOut;
}

export default {
  withdraw,
  getAsset,
  getCollateral,
};
