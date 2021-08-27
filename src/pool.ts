import { Pair, Uint112, Uint128, Uint256, Uint40 } from '.';
import { BorrowResult } from './helpers/borrowMath';
import { LendResult } from './helpers/lendMath';

export class Pool {
  pair: Pair;
  maturity: Uint256;

  constructor(
    pair: Pair,
    maturity: string | number | bigint | boolean | Uint256
  ) {
    this.pair = pair;
    this.maturity = new Uint256(maturity);
  }

  lendGivenBond(
    state: StateInput,
    assetIn: string | number | bigint | boolean | Uint112,
    bondOut: string | number | bigint | boolean | Uint128,
    now: string | number | bigint | boolean | Uint256
  ): LendResult {
    return this.pair.lendGivenBond(state, this.maturity, assetIn, bondOut, now);
  }

  lendGivenInsurance(
    state: StateInput,
    assetIn: string | number | bigint | boolean | Uint112,
    insuranceOut: string | number | bigint | boolean | Uint128,
    now: string | number | bigint | boolean | Uint256
  ): LendResult {
    return this.pair.lendGivenInsurance(
      state,
      this.maturity,
      assetIn,
      insuranceOut,
      now
    );
  }

  lendGivenPercent(
    state: StateInput,
    assetIn: string | number | bigint | boolean | Uint112,
    percent: string | number | bigint | boolean | Uint40
  ): LendResult {
    return this.pair.lendGivenPercent(state, assetIn, percent);
  }

  borrowGivenDebt(
    state: StateInput,
    assetOut: string | number | bigint | boolean | Uint112,
    debtOut: string | number | bigint | boolean | Uint128,
    now: string | number | bigint | boolean | Uint256
  ): BorrowResult {
    return this.pair.borrowGivenDebt(
      state,
      this.maturity,
      assetOut,
      debtOut,
      now
    );
  }

  borrowGivenCollateral(
    state: StateInput,
    assetOut: string | number | bigint | boolean | Uint112,
    collateralIn: string | number | bigint | boolean | Uint112,
    now: string | number | bigint | boolean | Uint256
  ): BorrowResult {
    return this.pair.borrowGivenCollateral(
      state,
      this.maturity,
      assetOut,
      collateralIn,
      now
    );
  }

  borrowGivenPercent(
    state: StateInput,
    assetOut: string | number | bigint | boolean | Uint112,
    percent: string | number | bigint | boolean | Uint40
  ): BorrowResult {
    return this.borrowGivenPercent(state, assetOut, percent);
  }
}

interface StateInput {
  asset: string | number | bigint | boolean | Uint112;
  interest: string | number | bigint | boolean | Uint112;
  cdp: string | number | bigint | boolean | Uint112;
}
