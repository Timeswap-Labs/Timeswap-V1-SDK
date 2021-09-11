import { ERC20Token } from './erc20Token';
import { CP, Due, Claims } from './interface';
import { Uint16, Uint256, Uint112, Uint128, Uint40 } from '../uint';
import {
  givenBond,
  givenInsurance,
  givenPercent as givenPercentLend,
  lend,
} from '../helpers/lendMath';
import {
  borrow,
  givenCollateral,
  givenPercent as givenPercentBorrow,
  givenDebt,
} from '../helpers/borrowMath';
import { givenAdd, givenNew, mint } from '../helpers/mintMath';

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
  ): { liquidityOut: Uint256; dueOut: Due } {
    const { yIncrease, zIncrease } = givenNew(
      maturity,
      assetIn,
      debtIn,
      collateralIn,
      now
    );

    return mint(
      protocolFee,
      state,
      totalLiquidity,
      maturity,
      assetIn,
      yIncrease,
      zIncrease,
      now
    );
  }

  static addLiquidity(
    state: CP,
    maturity: Uint256,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    now: Uint256,
    protocolFee: Uint16
  ): { liquidityOut: Uint256; dueOut: Due } {
    const { yIncrease, zIncrease } = givenAdd(state, assetIn);

    return mint(
      protocolFee,
      state,
      totalLiquidity,
      maturity,
      assetIn,
      yIncrease,
      zIncrease,
      now
    );
  }

  static lendGivenBond(
    state: CP,
    maturity: Uint256,
    assetIn: Uint112,
    bondOut: Uint128,
    now: Uint256,
    fee: Uint16
  ): Claims {
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

    return claims;
  }

  static lendGivenInsurance(
    state: CP,
    maturity: Uint256,
    assetIn: Uint112,
    insuranceOut: Uint128,
    now: Uint256,
    fee: Uint16
  ): Claims {
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

    return claims;
  }

  static lendGivenPercent(
    state: CP,
    maturity: Uint256,
    assetIn: Uint112,
    percent: Uint40,
    now: Uint256,
    fee: Uint16
  ): Claims {
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

    return claims;
  }

  static borrowGivenDebt(
    state: CP,
    maturity: Uint256,
    assetOut: Uint112,
    debtIn: Uint112,
    now: Uint256,
    fee: Uint16
  ): Due {
    const { yIncrease, zIncrease } = givenDebt(
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

    return due;
  }

  static borrowGivenCollateral(
    state: CP,
    maturity: Uint256,
    assetOut: Uint112,
    collateralIn: Uint112,
    now: Uint256,
    fee: Uint16
  ): Due {
    const { yIncrease, zIncrease } = givenCollateral(
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

    return due;
  }

  static borrowGivenPercent(
    state: CP,
    maturity: Uint256,
    assetOut: Uint112,
    percent: Uint40,
    now: Uint256,
    fee: Uint16
  ): Due {
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

    return due;
  }
}
