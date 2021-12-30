import { Pair } from './pair';
import { CP, Claims, Due, Tokens } from './interface';
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
  ): LiquidityReturn1 {
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

  liquidityGivenAsset(
    state: CP,
    totalLiquidity: Uint256,
    assetIn: Uint112,
    now: Uint256
  ): LiquidityReturn1 {
    return Pair.liquidityGivenAsset(
      state,
      this.maturity,
      totalLiquidity,
      assetIn,
      now,
      this.pair.protocolFee
    );
  }

  liquidityGivenDebt(
    state: CP,
    totalLiquidity: Uint256,
    debtIn: Uint112,
    now: Uint256
  ): LiquidityReturn2 {
    return Pair.liquidityGivenDebt(
      state,
      this.maturity,
      totalLiquidity,
      debtIn,
      now,
      this.pair.protocolFee
    );
  }

  liquidityGivenCollateral(
    state: CP,
    totalLiquidity: Uint256,
    collateralIn: Uint112,
    now: Uint256
  ): LiquidityReturn2 {
    return Pair.liquidityGivenCollateral(
      state,
      this.maturity,
      totalLiquidity,
      collateralIn,
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

  withdraw(reserves: Tokens, totalClaims: Claims, claimsIn: Claims): Tokens {
    return Pair.withdraw(reserves, totalClaims, claimsIn);
  }

  burn(
    reserves: Tokens,
    totalClaims: Claims,
    totalLiquidity: Uint256,
    liquidityIn: Uint256
  ): Tokens {
    return Pair.burn(reserves, totalClaims, totalLiquidity, liquidityIn);
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
