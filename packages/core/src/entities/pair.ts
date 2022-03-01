import {
  CP,
  Claims,
  Tokens,
  LiquidityReturn,
  LendReturn,
  BorrowReturn,
} from './interface';
import { Uint16, Uint256, Uint112, Uint128, Uint40 } from '../uint';
import {
  givenBond,
  givenInsurance,
  givenPercent as givenPercentLend,
  lend,
} from '../helpers/lendMath';
import {
  borrow,
  givenCollateral as givenCollateralBorrow,
  givenPercent as givenPercentBorrow,
  givenDebt as givenDebtBorrow,
} from '../helpers/borrowMath';
import {
  givenAsset,
  givenCollateral,
  givenDebt,
  givenNew,
  mint,
} from '../helpers/mintMath';
import { withdraw } from '../helpers/withdrawMath';
import { burn } from '../helpers/burnMath';

export class Pair {
  static calculateApr(state: CP): number {
    const SECONDS = 31556926n;
    const temp =
      (state.y.toBigInt() * SECONDS * 10000n) / (state.x.toBigInt() << 32n);
    const apr = Number(temp) / 10000;
    return apr;
  }

  static calculateCdp(state: CP, assetDecimals: number): bigint {
    let temp = 1n;
    for (let i = 0; i < assetDecimals; i++) temp *= 10n;
    return (state.z.toBigInt() * temp) / state.x.toBigInt();
  }

  static calculateNewLiquidity(
    state: CP,
    maturity: Uint256,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    debtIn: Uint112,
    collateralIn: Uint112,
    now: Uint256,
    feeStored: Uint256
  ): LiquidityReturn {
    const givenNewReturn = givenNew(
      maturity,
      assetIn,
      debtIn,
      collateralIn,
      now
    );

    const liquidityReturn = mint(
      feeStored,
      state,
      totalLiquidity,
      maturity,
      givenNewReturn.xIncrease,
      givenNewReturn.yIncrease,
      givenNewReturn.zIncrease,
      now
    );

    return { ...liquidityReturn, ...givenNewReturn };
  }

  static calculateLiquidityGivenAsset(
    state: CP,
    maturity: Uint256,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    now: Uint256,
    feeStored: Uint256
  ): LiquidityReturn {
    const givenAssetReturn = givenAsset(state, assetIn, feeStored);

    const liquidityReturn = mint(
      feeStored,
      state,
      totalLiquidity,
      maturity,
      givenAssetReturn.xIncrease,
      givenAssetReturn.yIncrease,
      givenAssetReturn.zIncrease,
      now
    );

    return { ...liquidityReturn, ...givenAssetReturn };
  }

  static calculateLiquidityGivenDebt(
    state: CP,
    maturity: Uint256,
    totalLiquidity: Uint256,
    debtIn: Uint112,
    now: Uint256,
    feeStored: Uint256
  ): LiquidityReturn {
    const givenDebtReturn = givenDebt(state, maturity, debtIn, now);

    const liquidityReturn = mint(
      feeStored,
      state,
      totalLiquidity,
      maturity,
      givenDebtReturn.xIncrease,
      givenDebtReturn.yIncrease,
      givenDebtReturn.zIncrease,
      now
    );

    return { ...liquidityReturn, ...givenDebtReturn };
  }

  static calculateLiquidityGivenCollateral(
    state: CP,
    maturity: Uint256,
    totalLiquidity: Uint256,
    collateralIn: Uint112,
    now: Uint256,
    feeStored: Uint256
  ): LiquidityReturn {
    const givenCollateralReturn = givenCollateral(
      state,
      maturity,
      collateralIn,
      now
    );

    const liquidityReturn = mint(
      feeStored,
      state,
      totalLiquidity,
      maturity,
      givenCollateralReturn.xIncrease,
      givenCollateralReturn.yIncrease,
      givenCollateralReturn.zIncrease,
      now
    );

    return { ...liquidityReturn, ...givenCollateralReturn };
  }

  static calculateLendGivenBond(
    state: CP,
    maturity: Uint256,
    assetIn: Uint112,
    bondOut: Uint128,
    now: Uint256,
    fee: Uint16,
    protocolFee: Uint16
  ): LendReturn {
    const givenBondReturn = givenBond(
      fee,
      protocolFee,
      state,
      maturity,
      assetIn,
      bondOut,
      now
    );

    const lendReturn = lend(
      fee,
      protocolFee,
      state,
      maturity,
      givenBondReturn.xIncrease,
      givenBondReturn.yDecrease,
      givenBondReturn.zDecrease,
      now
    );

    return { ...lendReturn, ...givenBondReturn };
  }

  static calculateLendGivenInsurance(
    state: CP,
    maturity: Uint256,
    assetIn: Uint112,
    insuranceOut: Uint128,
    now: Uint256,
    fee: Uint16,
    protocolFee: Uint16
  ): LendReturn {
    const givenInsuranceReturn = givenInsurance(
      fee,
      protocolFee,
      state,
      maturity,
      assetIn,
      insuranceOut,
      now
    );

    const lendReturn = lend(
      fee,
      protocolFee,
      state,
      maturity,
      givenInsuranceReturn.xIncrease,
      givenInsuranceReturn.yDecrease,
      givenInsuranceReturn.zDecrease,
      now
    );

    return { ...lendReturn, ...givenInsuranceReturn };
  }

  static calculateLendGivenPercent(
    state: CP,
    maturity: Uint256,
    assetIn: Uint112,
    percent: Uint40,
    now: Uint256,
    fee: Uint16,
    protocolFee: Uint16
  ): LendReturn {
    const givenPercentLendReturn = givenPercentLend(
      fee,
      protocolFee,
      state,
      maturity,
      assetIn,
      percent,
      now
    );

    const lendReturn = lend(
      fee,
      protocolFee,
      state,
      maturity,
      givenPercentLendReturn.xIncrease,
      givenPercentLendReturn.yDecrease,
      givenPercentLendReturn.zDecrease,
      now
    );

    return { ...lendReturn, ...givenPercentLendReturn };
  }

  static calculateWithdraw(
    reserves: Tokens,
    totalClaims: Claims,
    claimsIn: Claims
  ): Tokens {
    return withdraw(reserves, totalClaims, claimsIn);
  }

  static calculateBorrowGivenDebt(
    state: CP,
    maturity: Uint256,
    assetOut: Uint112,
    debtIn: Uint112,
    now: Uint256,
    fee: Uint16,
    protocolFee: Uint16
  ): BorrowReturn {
    const givenDebtBorrowReturn = givenDebtBorrow(
      fee,
      protocolFee,
      state,
      maturity,
      assetOut,
      debtIn,
      now
    );

    const borrowReturn = borrow(
      fee,
      protocolFee,
      state,
      maturity,
      givenDebtBorrowReturn.xDecrease,
      givenDebtBorrowReturn.yIncrease,
      givenDebtBorrowReturn.zIncrease,
      now
    );

    return { ...borrowReturn, ...givenDebtBorrowReturn };
  }

  static calculateBorrowGivenCollateral(
    state: CP,
    maturity: Uint256,
    assetOut: Uint112,
    collateralIn: Uint112,
    now: Uint256,
    fee: Uint16,
    protocolFee: Uint16
  ): BorrowReturn {
    const givenCollateralBorrowReturn = givenCollateralBorrow(
      fee,
      protocolFee,
      state,
      maturity,
      assetOut,
      collateralIn,
      now
    );

    const borrowReturn = borrow(
      fee,
      protocolFee,
      state,
      maturity,
      givenCollateralBorrowReturn.xDecrease,
      givenCollateralBorrowReturn.yIncrease,
      givenCollateralBorrowReturn.zIncrease,
      now
    );

    return { ...borrowReturn, ...givenCollateralBorrowReturn };
  }

  static calculateBorrowGivenPercent(
    state: CP,
    maturity: Uint256,
    assetOut: Uint112,
    percent: Uint40,
    now: Uint256,
    fee: Uint16,
    protocolFee: Uint16
  ): BorrowReturn {
    const givenPercentBorrowReturn = givenPercentBorrow(
      fee,
      protocolFee,
      state,
      maturity,
      assetOut,
      percent,
      now
    );

    const borrowReturn = borrow(
      fee,
      protocolFee,
      state,
      maturity,
      givenPercentBorrowReturn.xDecrease,
      givenPercentBorrowReturn.yIncrease,
      givenPercentBorrowReturn.zIncrease,
      now
    );

    return { ...borrowReturn, ...givenPercentBorrowReturn };
  }

  static calculateBurn(
    reserves: Tokens,
    totalClaims: Claims,
    totalLiquidity: Uint256,
    liquidityIn: Uint256,
    feeStored: Uint256
  ): { assetOut: Uint256; collateralOut: Uint128 } {
    return burn(feeStored, reserves, totalClaims, totalLiquidity, liquidityIn);
  }
}
