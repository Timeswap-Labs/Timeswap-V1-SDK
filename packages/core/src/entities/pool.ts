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

  newLiquidity(
    state: CP,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    debtIn: Uint112,
    collateralIn: Uint112,
    now: Uint256
  ): LiquidityReturn {
    return Pair.newLiquidity(
      state,
      this.maturity,
      totalLiquidity,
      assetIn,
      debtIn,
      collateralIn,
      now,
      this.pair.protocolFee
    );
  }

  addLiquidity(
    state: CP,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    now: Uint256
  ): LiquidityReturn {
    return Pair.addLiquidity(
      state,
      this.maturity,
      totalLiquidity,
      assetIn,
      now,
      this.pair.protocolFee
    );
  }

  lendGivenBond(
    state: CP,
    assetIn: Uint112,
    bondOut: Uint128,
    now: Uint256
  ): LendReturn {
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
  ): LendReturn {
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
  ): LendReturn {
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
  ): BorrowReturn {
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
  ): BorrowReturn {
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
  ): BorrowReturn {
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

interface LiquidityReturn {
  liquidityOut: Uint256;
  dueOut: Due;
  yIncrease: Uint112;
  zIncrease: Uint112;
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
