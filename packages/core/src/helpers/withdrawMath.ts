import { Claims, Tokens } from '../entities';
import { Uint256, Uint128, Uint112 } from '../uint';
import { mulDiv } from './fullMath';

export function withdraw(
  reserves: Tokens,
  totalClaims: Claims,
  claimsIn: Claims
): Tokens {
  const asset = getAsset(
    reserves,
    totalClaims,
    claimsIn.bondPrincipal,
    claimsIn.bondInterest
  );
  const collateral = getCollateral(
    reserves,
    totalClaims,
    new Uint128(claimsIn.insurancePrincipal),
    new Uint128(claimsIn.insuranceInterest)
  );

  return { asset, collateral };
}

function getAsset(
  reserves: Tokens,
  totalClaims: Claims,
  bondPrincipalIn: Uint112,
  bondInterestIn: Uint112
): Uint128 {
  const totalAsset = new Uint256(reserves.asset);
  const totalBondPrincipal = new Uint256(totalClaims.bondPrincipal);

  if (totalAsset >= totalBondPrincipal) {
    const assetOut = new Uint128(bondPrincipalIn);
    const remaining = new Uint256(totalAsset);
    remaining.subAssign(totalBondPrincipal);
    const totalBondInterest = new Uint256(totalClaims.bondInterest);
    if (remaining >= totalBondInterest) {
      assetOut.addAssign(bondInterestIn);
      return assetOut;
    }
    const _assetOut = new Uint256(bondInterestIn);
    _assetOut.mulAssign(remaining);
    _assetOut.divAssign(totalBondInterest);
    assetOut.addAssign(new Uint128(_assetOut));

    return assetOut;
  } else {
    const _assetOut = new Uint256(bondPrincipalIn);
    _assetOut.mulAssign(totalAsset);
    _assetOut.divAssign(totalBondPrincipal);
    return new Uint128(_assetOut);
  }
}

function getCollateral(
  reserves: Tokens,
  totalClaims: Claims,
  insurancePrincipalIn: Uint128,
  insuranceInterestIn: Uint128
): Uint128 {
  const collateralOut = new Uint128(0);

  const totalAsset = new Uint256(reserves.asset);
  const totalBond = new Uint256(totalClaims.bondPrincipal);
  totalBond.addAssign(totalClaims.bondInterest);

  if (totalAsset >= totalBond) return collateralOut;
  const deficit = new Uint256(totalBond);
  deficit.subAssign(totalAsset);

  const totalInsurancePrincipal = new Uint256(totalClaims.insurancePrincipal);
  totalInsurancePrincipal.mulAssign(deficit);
  const totalInsuranceInterest = new Uint256(totalClaims.insuranceInterest);
  totalInsuranceInterest.mulAssign(deficit);

  const _insurancePrincipalIn = new Uint256(insurancePrincipalIn);
  _insurancePrincipalIn.mulAssign(deficit);

  const totalCollateral = new Uint256(reserves.collateral);
  totalCollateral.mulAssign(totalBond);

  if (totalCollateral >= totalInsurancePrincipal) {
    const _insuranceInterestIn = new Uint256(insuranceInterestIn);
    _insuranceInterestIn.mulAssign(deficit);

    const remaining = new Uint256(totalCollateral);
    remaining.subAssign(totalInsurancePrincipal);
    if (remaining >= totalInsuranceInterest) {
      const _collateralOut = new Uint256(_insuranceInterestIn);
      _collateralOut.addAssign(_insurancePrincipalIn);
      _collateralOut.divAssign(totalBond);
      collateralOut.set(_collateralOut);
    } else {
      const _collateralOut = new Uint256(_insuranceInterestIn);
      const denominator = new Uint256(totalInsuranceInterest);
      denominator.mulAssign(totalBond);
      _collateralOut.set(mulDiv(_collateralOut, remaining, denominator));
      const addend = new Uint256(_insurancePrincipalIn);
      addend.divAssign(totalBond);
      _collateralOut.addAssign(addend);
      collateralOut.set(_collateralOut);
    }
  } else {
    const _collateralOut = new Uint256(_insurancePrincipalIn);
    const denominator = new Uint256(totalInsurancePrincipal);
    denominator.mulAssign(totalBond);
    _collateralOut.set(mulDiv(_collateralOut, totalCollateral, denominator));
    collateralOut.set(_collateralOut);
  }

  return collateralOut;
}

export default {
  withdraw,
  getAsset,
  getCollateral,
};
