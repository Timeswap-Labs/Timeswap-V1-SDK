import invariant from 'tiny-invariant';
import { Claims, CP, Due, Tokens } from '../entities';
import { Uint112, Uint128, Uint16, Uint256 } from '../uint';
import { checkConstantProduct } from './constantProduct';
import { mulDiv, mulDivUp } from './fullMath';
import { divUp, shiftRightUp } from './math';

const BASE = new Uint256(0x10000000000);

export function mint(
  maturity: Uint256,
  state: CP,
  totalLiquidity: Uint256,
  feeStored: Uint256,
  xIncrease: Uint112,
  yIncrease: Uint112,
  zIncrease: Uint112,
  now: Uint256
): {
  liquidityOut: Uint256;
  dueOut: Due;
  feeStoredIncrease: Uint256;
} {
  const liquidityOut = new Uint256(0);
  const feeStoredIncrease = new Uint256(0);

  if (totalLiquidity.eq(0)) {
    liquidityOut.set(xIncrease);
    liquidityOut.shlAssign(16);
  } else {
    const fromX = mulDiv(
      totalLiquidity,
      new Uint256(xIncrease),
      new Uint256(state.x)
    );
    const fromY = mulDiv(
      totalLiquidity,
      new Uint256(yIncrease),
      new Uint256(state.y)
    );
    const fromZ = mulDiv(
      totalLiquidity,
      new Uint256(zIncrease),
      new Uint256(state.z)
    );

    invariant(fromY.lte(fromX), 'E214');
    invariant(fromZ.lte(fromX), 'E215');

    liquidityOut.set(fromY.lte(fromZ) ? fromY : fromZ);

    feeStoredIncrease.set(mulDivUp(feeStored, liquidityOut, totalLiquidity));
  }

  const _debtIn = new Uint256(maturity);
  _debtIn.subAssign(now);
  _debtIn.mulAssign(yIncrease);
  _debtIn.set(shiftRightUp(_debtIn, new Uint256(32)));
  _debtIn.addAssign(xIncrease);
  const debt = new Uint112(_debtIn);

  const _collateralIn = new Uint256(maturity);
  _collateralIn.subAssign(now);
  _collateralIn.mulAssign(zIncrease);
  _collateralIn.set(shiftRightUp(_collateralIn, new Uint256(25)));
  _collateralIn.addAssign(zIncrease);
  const collateral = new Uint112(_collateralIn);

  return { liquidityOut, dueOut: { debt, collateral }, feeStoredIncrease };
}

export function burn(
  totalLiquidity: Uint256,
  feeStored: Uint256,
  reserves: Tokens,
  totalClaims: Claims,
  liquidityIn: Uint256
): {
  assetOut: Uint128;
  collateralOut: Uint128;
  feeOut: Uint256;
} {
  const assetOut = new Uint128(0);
  const collateralOut = new Uint128(0);

  const totalAsset = new Uint256(reserves.asset);
  const totalCollateral = new Uint256(reserves.collateral);
  const totalBond = new Uint256(totalClaims.bondPrincipal);
  totalBond.addAssign(totalClaims.bondInterest);

  if (totalAsset.gte(totalBond)) {
    const _assetOut = new Uint256(totalAsset);
    _assetOut.subAssign(totalBond);
    _assetOut.set(mulDiv(_assetOut, liquidityIn, totalLiquidity));
    assetOut.set(_assetOut);

    const _collateralOut = new Uint256(totalCollateral);
    _collateralOut.set(mulDiv(_collateralOut, liquidityIn, totalLiquidity));
    collateralOut.set(_collateralOut);
  } else {
    const deficit = new Uint256(totalBond);
    deficit.subAssign(totalAsset);

    const totalInsurance = new Uint256(totalClaims.insurancePrincipal);
    totalInsurance.addAssign(totalClaims.insuranceInterest);

    if (totalCollateral.mul(totalBond).gt(deficit.mul(totalInsurance))) {
      const _collateralOut = new Uint256(totalCollateral);
      const subtrahend = new Uint256(deficit);
      subtrahend.mulAssign(totalInsurance);
      subtrahend.set(divUp(subtrahend, totalBond));
      _collateralOut.subAssign(subtrahend);
      _collateralOut.set(mulDiv(_collateralOut, liquidityIn, totalLiquidity));
      collateralOut.set(_collateralOut);
    }
  }

  const feeOut = mulDiv(feeStored, liquidityIn, totalLiquidity);

  return { assetOut, collateralOut, feeOut };
}

export function lend(
  maturity: Uint256,
  state: CP,
  xIncrease: Uint112,
  yDecrease: Uint112,
  zDecrease: Uint112,
  fee: Uint16,
  protocolFee: Uint16,
  now: Uint256
): {
  claimsOut: Claims;
  feeStoredIncrease: Uint256;
  protocolFeeStoredIncrease: Uint256;
} {
  lendCheck(state, xIncrease, yDecrease, zDecrease);

  const bondPrincipal = xIncrease;
  const bondInterest = getBondInterest(maturity, yDecrease, now);
  const insurancePrincipal = getInsurancePrincipal(state, xIncrease);
  const insuranceInterest = getInsuranceInterest(maturity, zDecrease, now);

  const { feeStoredIncrease, protocolFeeStoredIncrease } = lendGetFees(
    maturity,
    xIncrease,
    fee,
    protocolFee,
    now
  );

  return {
    claimsOut: {
      bondPrincipal,
      bondInterest,
      insurancePrincipal,
      insuranceInterest,
    },
    feeStoredIncrease,
    protocolFeeStoredIncrease,
  };
}

function lendCheck(
  state: CP,
  xIncrease: Uint112,
  yDecrease: Uint112,
  zDecrease: Uint112
) {
  const xReserve = state.x.add(xIncrease);
  const yReserve = state.y.sub(yDecrease);
  const zReserve = state.z.sub(zDecrease);
  checkConstantProduct(
    state,
    xReserve,
    new Uint128(yReserve),
    new Uint128(zReserve)
  );

  let yMin = xIncrease;
  yMin.mulAssign(state.y);
  yMin.divAssign(xReserve);
  yMin.shrAssign(4);
  invariant(yDecrease.lt(yMin), 'E217');
}

function getBondInterest(
  maturity: Uint256,
  yDecrease: Uint112,
  now: Uint256
): Uint112 {
  const _bondPrincipalOut = new Uint256(maturity);
  _bondPrincipalOut.subAssign(now);
  _bondPrincipalOut.mulAssign(yDecrease);
  _bondPrincipalOut.shrAssign(32);
  const bondPrincipalOut = new Uint112(_bondPrincipalOut);

  return bondPrincipalOut;
}

function getInsurancePrincipal(state: CP, xIncrease: Uint112): Uint112 {
  const _insurancePrincipalOut = new Uint256(state.z);
  _insurancePrincipalOut.mulAssign(xIncrease);
  const denominator = new Uint256(state.x);
  denominator.addAssign(xIncrease);
  _insurancePrincipalOut.divAssign(denominator);
  const insurancePrincipalOut = new Uint112(_insurancePrincipalOut);

  return insurancePrincipalOut;
}

function getInsuranceInterest(
  maturity: Uint256,
  zDecrease: Uint112,
  now: Uint256
): Uint112 {
  const _insuranceInterestOut = new Uint256(maturity);
  _insuranceInterestOut.subAssign(now);
  _insuranceInterestOut.mulAssign(zDecrease);
  _insuranceInterestOut.shrAssign(25);
  const insuranceInterestOut = new Uint112(_insuranceInterestOut);

  return insuranceInterestOut;
}

function lendGetFees(
  maturity: Uint256,
  xIncrease: Uint112,
  fee: Uint16,
  protocolFee: Uint16,
  now: Uint256
): {
  feeStoredIncrease: Uint256;
  protocolFeeStoredIncrease: Uint256;
} {
  const totalFee = new Uint256(fee);
  totalFee.addAssign(protocolFee);

  const numerator = new Uint256(maturity);
  numerator.subAssign(now);
  numerator.mulAssign(totalFee);
  numerator.addAssign(BASE);

  const adjusted = new Uint256(xIncrease);
  adjusted.mulAssign(numerator);
  adjusted.set(divUp(adjusted, BASE));
  const totalFeeStoredIncrease = new Uint256(adjusted);
  totalFeeStoredIncrease.subAssign(xIncrease);

  const feeStoredIncrease = new Uint256(totalFeeStoredIncrease);
  feeStoredIncrease.mulAssign(fee);
  feeStoredIncrease.divAssign(totalFee);
  const protocolFeeStoredIncrease = new Uint256(totalFeeStoredIncrease);
  protocolFeeStoredIncrease.subAssign(feeStoredIncrease);

  return { feeStoredIncrease, protocolFeeStoredIncrease };
}

export function withdraw(
  reserves: Tokens,
  totalClaims: Claims,
  claimsIn: Claims
): Tokens {
  const tokensOut = {
    asset: new Uint128(0),
    collateral: new Uint128(0),
  };

  const totalAsset = new Uint256(reserves.asset);
  const totalBondPrincipal = new Uint256(totalClaims.bondPrincipal);
  const totalBondInterest = new Uint256(totalClaims.bondInterest);
  const totalBond = new Uint256(totalBondPrincipal);
  totalBond.addAssign(totalBondInterest);

  if (totalAsset.gte(totalBond)) {
    tokensOut.asset.set(claimsIn.bondPrincipal);
    tokensOut.asset.addAssign(claimsIn.bondInterest);
  } else {
    if (totalAsset.gte(totalBondPrincipal)) {
      const remaining = new Uint256(totalAsset);
      remaining.subAssign(totalBondPrincipal);
      const _assetOut = new Uint256(claimsIn.bondInterest);
      _assetOut.mulAssign(remaining);
      _assetOut.divAssign(totalBondInterest);
      _assetOut.addAssign(claimsIn.bondPrincipal);
      tokensOut.asset.set(_assetOut);
    } else {
      const _assetOut = new Uint256(claimsIn.bondPrincipal);
      _assetOut.mulAssign(totalAsset);
      _assetOut.divAssign(totalBondPrincipal);
      tokensOut.asset.set(_assetOut);
    }

    const deficit = new Uint256(totalBond);
    deficit.subAssign(totalAsset);

    const totalInsurancePrincipal = new Uint256(totalClaims.insurancePrincipal);
    totalInsurancePrincipal.mulAssign(deficit);
    const totalInsuranceInterest = new Uint256(totalClaims.insuranceInterest);
    totalInsuranceInterest.mulAssign(deficit);
    const totalInsurance = new Uint256(totalInsurancePrincipal);
    totalInsurance.addAssign(totalInsuranceInterest);

    const totalCollateral = new Uint256(reserves.collateral);
    totalCollateral.mulAssign(totalBond);

    if (totalCollateral.gte(totalInsurance)) {
      const _collateralOut = new Uint256(claimsIn.insurancePrincipal);
      _collateralOut.addAssign(claimsIn.insuranceInterest);
      _collateralOut.mulAssign(deficit);
      _collateralOut.divAssign(totalBond);
      tokensOut.collateral.set(_collateralOut);
    } else if (totalCollateral.gte(totalInsurancePrincipal)) {
      const remaining = new Uint256(totalCollateral);
      remaining.subAssign(totalInsurancePrincipal);
      const _collateralOut = new Uint256(claimsIn.insuranceInterest);
      _collateralOut.mulAssign(deficit);
      const denominator = new Uint256(totalInsuranceInterest);
      denominator.mulAssign(totalBond);
      _collateralOut.set(mulDiv(_collateralOut, remaining, denominator));
      const addend = new Uint256(claimsIn.insurancePrincipal);
      addend.mulAssign(deficit);
      addend.divAssign(totalBond);
      _collateralOut.addAssign(addend);
      tokensOut.collateral.set(_collateralOut);
    } else {
      const _collateralOut = new Uint256(claimsIn.insurancePrincipal);
      _collateralOut.mulAssign(deficit);
      const denominator = new Uint256(totalInsurancePrincipal);
      denominator.mulAssign(totalBond);
      _collateralOut.set(mulDiv(_collateralOut, totalCollateral, denominator));
      tokensOut.collateral.set(_collateralOut);
    }
  }

  return tokensOut;
}

export function borrow(
  maturity: Uint256,
  state: CP,
  xDecrease: Uint112,
  yIncrease: Uint112,
  zIncrease: Uint112,
  fee: Uint16,
  protocolFee: Uint16,
  now: Uint256
): {
  dueOut: Due;
  feeStoredIncrease: Uint256;
  protocolFeeStoredIncrease: Uint256;
} {
  borrowCheck(state, xDecrease, yIncrease, zIncrease);

  const debt = getDebt(maturity, xDecrease, yIncrease, now);
  const collateral = getCollateral(maturity, state, xDecrease, zIncrease, now);

  const { feeStoredIncrease, protocolFeeStoredIncrease } = borrowGetFees(
    maturity,
    xDecrease,
    fee,
    protocolFee,
    now
  );

  return {
    dueOut: { debt, collateral },
    feeStoredIncrease,
    protocolFeeStoredIncrease,
  };
}

function borrowCheck(
  state: CP,
  xDecrease: Uint112,
  yIncrease: Uint112,
  zIncrease: Uint112
) {
  const xReserve = state.x.sub(xDecrease);
  const yReserve = state.y.add(yIncrease);
  const zReserve = state.z.add(zIncrease);
  checkConstantProduct(
    state,
    xReserve,
    new Uint128(yReserve),
    new Uint128(zReserve)
  );

  const yMax = new Uint256(xDecrease);
  yMax.mulAssign(state.y);
  yMax.set(divUp(yMax, new Uint256(xReserve)));
  invariant(yIncrease.lte(yMax), 'E214');

  const zMax = new Uint256(xDecrease);
  zMax.mulAssign(state.z);
  zMax.set(divUp(zMax, new Uint256(xReserve)));
  invariant(zIncrease.lte(zMax), 'E215');

  let yMin = yMax;
  yMin.shrAssign(4);
  invariant(yIncrease.lt(yMin), 'E217');
}

function getDebt(
  maturity: Uint256,
  xDecrease: Uint112,
  yIncrease: Uint112,
  now: Uint256
): Uint112 {
  const _debtIn = new Uint256(maturity);
  _debtIn.subAssign(now);
  _debtIn.mulAssign(yIncrease);
  _debtIn.set(shiftRightUp(_debtIn, new Uint256(32)));
  _debtIn.addAssign(xDecrease);
  const debtIn = new Uint112(_debtIn);

  return debtIn;
}

function getCollateral(
  maturity: Uint256,
  state: CP,
  xDecrease: Uint112,
  zIncrease: Uint112,
  now: Uint256
): Uint112 {
  const _collateralIn = new Uint256(maturity);
  _collateralIn.subAssign(now);
  _collateralIn.mulAssign(zIncrease);
  _collateralIn.set(shiftRightUp(_collateralIn, new Uint256(25)));
  const minimum = new Uint256(state.z);
  minimum.mulAssign(xDecrease);
  const denominator = new Uint256(state.x);
  denominator.subAssign(xDecrease);
  minimum.set(divUp(minimum, denominator));
  _collateralIn.addAssign(minimum);
  const collateralIn = new Uint112(_collateralIn);

  return collateralIn;
}

function borrowGetFees(
  maturity: Uint256,
  xDecrease: Uint112,
  fee: Uint16,
  protocolFee: Uint16,
  now: Uint256
): {
  feeStoredIncrease: Uint256;
  protocolFeeStoredIncrease: Uint256;
} {
  const totalFee = new Uint256(fee);
  totalFee.addAssign(protocolFee);

  const denominator = new Uint256(maturity);
  denominator.subAssign(now);
  denominator.mulAssign(totalFee);
  denominator.addAssign(BASE);

  const adjusted = new Uint256(xDecrease);
  adjusted.mulAssign(BASE);
  adjusted.divAssign(denominator);
  const totalFeeStoredIncrease = new Uint256(xDecrease);
  totalFeeStoredIncrease.subAssign(adjusted);

  const feeStoredIncrease = new Uint256(totalFeeStoredIncrease);
  feeStoredIncrease.mulAssign(fee);
  feeStoredIncrease.divAssign(totalFee);
  const protocolFeeStoredIncrease = new Uint256(totalFeeStoredIncrease);
  protocolFeeStoredIncrease.subAssign(feeStoredIncrease);

  return { feeStoredIncrease, protocolFeeStoredIncrease };
}

export default {
  mint,
  burn,
  lend,
  withdraw,
  borrow,
};
