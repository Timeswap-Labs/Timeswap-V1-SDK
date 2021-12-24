import { ERC20Token } from './erc20Token';
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
  public readonly asset: ERC20Token;
  public readonly collateral: ERC20Token;

  public readonly fee: Uint16;
  public readonly protocolFee: Uint16;

  constructor(
    asset: ERC20Token,
    collateral: ERC20Token,
    fee: Uint16,
    protocolFee: Uint16
  ) {
    this.asset = asset;
    this.collateral = collateral;

    this.fee = new Uint16(fee);
    this.protocolFee = new Uint16(protocolFee);
  }

  static newLiquidity(
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

  static liquidityGivenAsset(
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

  static liquidityGivenDebt(
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

  static liquidityGivenCollateral(
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

  static lendGivenBond(
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

  static lendGivenInsurance(
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

  static lendGivenPercent(
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

  static borrowGivenDebt(
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

  static borrowGivenCollateral(
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

  static borrowGivenPercent(
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

  static withdraw(
    reserves: Tokens,
    totalClaims: Claims,
    claimsIn: Claims
  ): Tokens {
    return withdraw(reserves, totalClaims, claimsIn);
  }

  static burn(
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
