import { Claims, Tokens } from '../entities';
import { Uint256, Uint128 } from '../uint';

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
  if (reserves.asset.gte(totalClaims.bond)) {
    assetOut.set(bondIn);
    return assetOut;
  }
  const _assetOut = new Uint256(bondIn);
  _assetOut.mulAssign(reserves.asset);
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
  if (reserves.asset.gte(totalClaims.bond)) return collateralOut;
  const deficit = new Uint256(totalClaims.bond);
  deficit.subAssign(reserves.asset);
  if (
    new Uint256(reserves.collateral)
      .mul(totalClaims.bond)
      .gte(deficit.mul(totalClaims.insurance))
  ) {
    const _collateralOut = new Uint256(deficit);
    _collateralOut.mulAssign(insuranceIn);
    _collateralOut.divAssign(totalClaims.bond);
    collateralOut.set(_collateralOut);
    return collateralOut;
  }
  const __collateralOut = new Uint256(reserves.collateral);
  __collateralOut.mulAssign(insuranceIn);
  __collateralOut.divAssign(totalClaims.insurance);
  collateralOut.set(__collateralOut);

  return collateralOut;
}

export default {
  withdraw,
  getAsset,
  getCollateral,
};
