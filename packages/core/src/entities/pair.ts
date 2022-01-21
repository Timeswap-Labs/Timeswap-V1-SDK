import { CP, Due, Claims, Tokens } from './interface';
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
    protocolFee: Uint16
  ): LiquidityReturn1 {
    const { yIncrease, zIncrease } = givenNew(
      maturity,
      assetIn,
      debtIn,
      collateralIn,
      now
    );

    const { liquidityOut, dueOut } = mint(
      protocolFee,
      state,
      totalLiquidity,
      maturity,
      assetIn,
      yIncrease,
      zIncrease,
      now
    );

    return { liquidityOut, dueOut, yIncrease, zIncrease };
  }

  static calculateLiquidityGivenAsset(
    state: CP,
    maturity: Uint256,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    now: Uint256,
    protocolFee: Uint16
  ): LiquidityReturn1 {
    const { yIncrease, zIncrease } = givenAsset(state, assetIn);

    const { liquidityOut, dueOut } = mint(
      protocolFee,
      state,
      totalLiquidity,
      maturity,
      assetIn,
      yIncrease,
      zIncrease,
      now
    );

    return { liquidityOut, dueOut, yIncrease, zIncrease };
  }

  static calculateLiquidityGivenDebt(
    state: CP,
    maturity: Uint256,
    totalLiquidity: Uint256,
    debtIn: Uint112,
    now: Uint256,
    protocolFee: Uint16
  ): LiquidityReturn2 {
    const { xIncrease, yIncrease, zIncrease } = givenDebt(
      state,
      maturity,
      debtIn,
      now
    );

    const { liquidityOut, dueOut } = mint(
      protocolFee,
      state,
      totalLiquidity,
      maturity,
      xIncrease,
      yIncrease,
      zIncrease,
      now
    );

    return { liquidityOut, dueOut, xIncrease, yIncrease, zIncrease };
  }

  static calculateLiquidityGivenCollateral(
    state: CP,
    maturity: Uint256,
    totalLiquidity: Uint256,
    collateralIn: Uint112,
    now: Uint256,
    protocolFee: Uint16
  ): LiquidityReturn2 {
    const { xIncrease, yIncrease, zIncrease } = givenCollateral(
      state,
      maturity,
      collateralIn,
      now
    );

    const { liquidityOut, dueOut } = mint(
      protocolFee,
      state,
      totalLiquidity,
      maturity,
      xIncrease,
      yIncrease,
      zIncrease,
      now
    );

    return { liquidityOut, dueOut, xIncrease, yIncrease, zIncrease };
  }

  static calculateLendGivenBond(
    state: CP,
    maturity: Uint256,
    assetIn: Uint112,
    bondOut: Uint128,
    now: Uint256,
    fee: Uint16
  ): LendReturn {
    const { yDecrease, zDecrease } = givenBond(
      fee,
      state,
      maturity,
      assetIn,
      bondOut,
      now
    );

    const claims = lend(
      fee,
      state,
      maturity,
      assetIn,
      yDecrease,
      zDecrease,
      now
    );

    return { claims, yDecrease, zDecrease };
  }

  static calculateLendGivenInsurance(
    state: CP,
    maturity: Uint256,
    assetIn: Uint112,
    insuranceOut: Uint128,
    now: Uint256,
    fee: Uint16
  ): LendReturn {
    const { yDecrease, zDecrease } = givenInsurance(
      fee,
      state,
      maturity,
      assetIn,
      insuranceOut,
      now
    );

    const claims = lend(
      fee,
      state,
      maturity,
      assetIn,
      yDecrease,
      zDecrease,
      now
    );

    return { claims, yDecrease, zDecrease };
  }

  static calculateLendGivenPercent(
    state: CP,
    maturity: Uint256,
    assetIn: Uint112,
    percent: Uint40,
    now: Uint256,
    fee: Uint16
  ): LendReturn {
    const { yDecrease, zDecrease } = givenPercentLend(
      fee,
      state,
      assetIn,
      percent
    );

    const claims = lend(
      fee,
      state,
      maturity,
      assetIn,
      yDecrease,
      zDecrease,
      now
    );

    return { claims, yDecrease, zDecrease };
  }

  static calculateBorrowGivenDebt(
    state: CP,
    maturity: Uint256,
    assetOut: Uint112,
    debtIn: Uint112,
    now: Uint256,
    fee: Uint16
  ): BorrowReturn {
    const { yIncrease, zIncrease } = givenDebtBorrow(
      fee,
      state,
      maturity,
      assetOut,
      debtIn,
      now
    );

    const due = borrow(
      fee,
      state,
      maturity,
      assetOut,
      yIncrease,
      zIncrease,
      now
    );

    return { due, yIncrease, zIncrease };
  }

  static calculateBorrowGivenCollateral(
    state: CP,
    maturity: Uint256,
    assetOut: Uint112,
    collateralIn: Uint112,
    now: Uint256,
    fee: Uint16
  ): BorrowReturn {
    const { yIncrease, zIncrease } = givenCollateralBorrow(
      fee,
      state,
      maturity,
      assetOut,
      collateralIn,
      now
    );

    const due = borrow(
      fee,
      state,
      maturity,
      assetOut,
      yIncrease,
      zIncrease,
      now
    );

    return { due, yIncrease, zIncrease };
  }

  static calculateBorrowGivenPercent(
    state: CP,
    maturity: Uint256,
    assetOut: Uint112,
    percent: Uint40,
    now: Uint256,
    fee: Uint16
  ): BorrowReturn {
    const { yIncrease, zIncrease } = givenPercentBorrow(
      fee,
      state,
      assetOut,
      percent
    );

    const due = borrow(
      fee,
      state,
      maturity,
      assetOut,
      yIncrease,
      zIncrease,
      now
    );

    return { due, yIncrease, zIncrease };
  }

  static calculateWithdraw(
    reserves: Tokens,
    totalClaims: Claims,
    claimsIn: Claims
  ): Tokens {
    return withdraw(reserves, totalClaims, claimsIn);
  }

  static calculateBurn(
    reserves: Tokens,
    totalClaims: Claims,
    totalLiquidity: Uint256,
    liquidityIn: Uint256
  ): Tokens {
    return burn(reserves, totalClaims, totalLiquidity, liquidityIn);
  }
}

interface LiquidityReturn1 {
  liquidityOut: Uint256;
  dueOut: Due;
  yIncrease: Uint112;
  zIncrease: Uint112;
}

interface LiquidityReturn2 extends LiquidityReturn1 {
  xIncrease: Uint112;
}

interface LendReturn {
  claims: Claims;
  yDecrease: Uint112;
  zDecrease: Uint112;
}

interface BorrowReturn {
  due: Due;
  yIncrease: Uint112;
  zIncrease: Uint112;
}
