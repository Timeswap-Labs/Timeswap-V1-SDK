import {
  Pair,
  State,
  Uint112,
  Uint128,
  Uint256,
  Uint40,
  Claims,
  Due,
} from '../';

export class Pool {
  pair: Pair;
  maturity: Uint256;

  constructor(pair: Pair, maturity: Uint256) {
    this.pair = pair;
    this.maturity = new Uint256(maturity);
  }

  lendGivenBond(
    state: State,
    assetIn: Uint112,
    bondOut: Uint128,
    now: Uint256
  ): Claims {
    return Pair.lendGivenBond(
      state,
      this.maturity,
      assetIn,
      bondOut,
      now,
      this.pair.fee
    );
  }

  lendGivenInsurance(
    state: State,
    assetIn: Uint112,
    insuranceOut: Uint128,
    now: Uint256
  ): Claims {
    return Pair.lendGivenInsurance(
      state,
      this.maturity,
      assetIn,
      insuranceOut,
      now,
      this.pair.fee
    );
  }

  lendGivenPercent(
    state: State,
    assetIn: Uint112,
    percent: Uint40,
    now: Uint256
  ): Claims {
    return Pair.lendGivenPercent(
      state,
      this.maturity,
      assetIn,
      percent,
      now,
      this.pair.fee
    );
  }

  borrowGivenDebt(
    state: State,
    assetOut: Uint112,
    debtIn: Uint112,
    now: Uint256
  ): Due {
    return Pair.borrowGivenDebt(
      state,
      this.maturity,
      assetOut,
      debtIn,
      now,
      this.pair.fee
    );
  }

  borrowGivenCollateral(
    state: State,
    assetOut: Uint112,
    collateralIn: Uint112,
    now: Uint256
  ): Due {
    return Pair.borrowGivenCollateral(
      state,
      this.maturity,
      assetOut,
      collateralIn,
      now,
      this.pair.fee
    );
  }

  borrowGivenPercent(
    state: State,
    assetOut: Uint112,
    percent: Uint40,
    now: Uint256
  ): Due {
    return Pair.borrowGivenPercent(
      state,
      this.maturity,
      assetOut,
      percent,
      now,
      this.pair.fee
    );
  }
}
