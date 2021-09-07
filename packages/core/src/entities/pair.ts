import {
  ERC20Token,
  Pool,
  Uint112,
  Uint128,
  Uint16,
  Uint256,
  State,
  Uint40,
  Claims,
  Due,
} from '../';
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

  getPool(maturity: Uint256): Pool {
    return new Pool(this, maturity);
  }

  static lendGivenBond(
    state: State,
    maturity: Uint256,
    assetIn: Uint112,
    bondOut: Uint128,
    now: Uint256,
    fee: Uint16
  ): Claims {
    const { interestDecrease, cdpDecrease } = givenBond(
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
      interestDecrease,
      cdpDecrease,
      now
    );

    return claims;
  }

  static lendGivenInsurance(
    state: State,
    maturity: Uint256,
    assetIn: Uint112,
    insuranceOut: Uint128,
    now: Uint256,
    fee: Uint16
  ): Claims {
    const { interestDecrease, cdpDecrease } = givenInsurance(
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
      interestDecrease,
      cdpDecrease,
      now
    );

    return claims;
  }

  static lendGivenPercent(
    state: State,
    maturity: Uint256,
    assetIn: Uint112,
    percent: Uint40,
    now: Uint256,
    fee: Uint16
  ): Claims {
    const { interestDecrease, cdpDecrease } = givenPercentLend(
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
      interestDecrease,
      cdpDecrease,
      now
    );

    return claims;
  }

  static borrowGivenDebt(
    state: State,
    maturity: Uint256,
    assetOut: Uint112,
    debtIn: Uint112,
    now: Uint256,
    fee: Uint16
  ): Due {
    const { interestIncrease, cdpIncrease } = givenDebt(
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
      interestIncrease,
      cdpIncrease,
      now
    );

    return due;
  }

  static borrowGivenCollateral(
    state: State,
    maturity: Uint256,
    assetOut: Uint112,
    collateralIn: Uint112,
    now: Uint256,
    fee: Uint16
  ): Due {
    const { interestIncrease, cdpIncrease } = givenCollateral(
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
      interestIncrease,
      cdpIncrease,
      now
    );

    return due;
  }

  static borrowGivenPercent(
    state: State,
    maturity: Uint256,
    assetOut: Uint112,
    percent: Uint40,
    now: Uint256,
    fee: Uint16
  ): Due {
    const { interestIncrease, cdpIncrease } = givenPercentBorrow(
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
      interestIncrease,
      cdpIncrease,
      now
    );

    return due;
  }
}
