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
  const totalAsset = new Uint256(reserves.asset);
  const totalBond = new Uint256(totalClaims.bondPrincipal);
  totalBond.addAssign(totalClaims.bondInterest);

  if (totalAsset.lte(totalBond)) return assetOut;
  const _assetOut = new Uint256(totalAsset);
  _assetOut.subAssign(totalBond);
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
  const totalAsset = new Uint256(reserves.asset);
  const totalCollateral = new Uint256(reserves.collateral);
  const totalBond = new Uint256(totalClaims.bondPrincipal);
  totalBond.addAssign(totalClaims.bondInterest);

  const _collateralOut = new Uint256(totalCollateral);
  if (totalAsset.gte(totalBond)) {
    _collateralOut.set(mulDiv(_collateralOut, liquidityIn, totalLiquidity));
    collateralOut.set(_collateralOut);
    return collateralOut;
  }
  const deficit = new Uint256(totalBond);
  deficit.subAssign(totalAsset);
  const totalInsurance = new Uint256(totalClaims.insurancePrincipal);
  totalInsurance.addAssign(totalClaims.insuranceInterest);
  if (totalCollateral.mul(totalBond).lte(deficit.mul(totalInsurance)))
    return collateralOut;
  const subtrahend = new Uint256(deficit);
  subtrahend.mulAssign(totalInsurance);
  subtrahend.set(divUp(subtrahend, new Uint256(totalBond)));
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
