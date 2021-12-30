import { Claims, Tokens } from '../entities';
import { Uint256, Uint128 } from '../uint';
import { mulDiv } from './fullMath';
import { divUp } from './math';

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
  if (reserves.asset.lte(totalClaims.bond)) return assetOut;
  const _assetOut = new Uint256(reserves.asset);
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
  const _collateralOut = new Uint256(reserves.collateral);
  if (reserves.asset.gte(totalClaims.bond)) {
    _collateralOut.set(mulDiv(_collateralOut, liquidityIn, totalLiquidity));
    collateralOut.set(_collateralOut);
    return collateralOut;
  }
  const deficit = new Uint256(totalClaims.bond);
  deficit.subAssign(reserves.asset);
  if (
    new Uint256(reserves.collateral)
      .mul(totalClaims.bond)
      .lte(deficit.mul(totalClaims.insurance))
  )
    return collateralOut;
  const subtrahend = new Uint256(deficit);
  subtrahend.mulAssign(totalClaims.insurance);
  subtrahend.set(divUp(subtrahend, new Uint256(totalClaims.bond)));
  _collateralOut.subAssign(subtrahend);
  _collateralOut.set(mulDiv(_collateralOut, liquidityIn, totalLiquidity));
  collateralOut.set(_collateralOut);
  return collateralOut;
}

export default {
  burn,
  getAsset,
  getCollateral,
};
