import { Pair } from './pair';
import { CP, Claims, Due } from './interface';
import { Uint256, Uint112, Uint128, Uint40 } from '../uint';

export class Pool {
  pair: Pair;
  maturity: Uint256;

  constructor(pair: Pair, maturity: Uint256) {
    this.pair = pair;
    this.maturity = new Uint256(maturity);
  }

  lendGivenBond(
    state: CP,
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
    state: CP,
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
    state: CP,
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
    state: CP,
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
    state: CP,
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
    state: CP,
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
